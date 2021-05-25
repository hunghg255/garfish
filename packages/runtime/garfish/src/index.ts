import { Garfish } from '@garfish/core';
import GarfishRouter from '@garfish/router';
import GarfishBrowserVm from '@garfish/browser-vm';
import GarfishBrowserSnapshot from '@garfish/browser-snapshot';
import { def, hasOwn, warn, __GARFISH_FLAG__ } from '@garfish/utils';

// Initialize the Garfish, currently existing environment to allow only one instance (export to is for test)
export function createContext() {
  let fresh = false;
  const GarfishInstance = new Garfish({
    plugins: [GarfishRouter(), GarfishBrowserVm(), GarfishBrowserSnapshot()],
  });

  type globalValue = boolean | Garfish | Record<string, unknown>;
  const set = (namespace: string, val: globalValue = GarfishInstance) => {
    if (hasOwn(window, namespace)) {
      if (!(window[namespace] && window[namespace].flag === __GARFISH_FLAG__)) {
        const next = () => {
          fresh = true;
          if (__DEV__) {
            warn(
              `"Window.${namespace}" will be overwritten by "@garfish/framework".`,
            );
          }
        };
        const desc = Object.getOwnPropertyDescriptor(window, namespace);
        if (desc) {
          if (desc.configurable) {
            def(window, namespace, val);
            next();
          } else if (desc.writable) {
            window[namespace] = val;
            next();
          }
        }
      } else if (
        window[namespace] &&
        window[namespace].flag === __GARFISH_FLAG__
      ) {
        // Nested scene
        window[namespace].subInstances.push(GarfishInstance);
      }
    } else {
      fresh = true;
      def(window, namespace, val);
    }
  };

  set('Gar');
  set('Garfish');

  // 全局标识符
  set('__GAR__', true);
  set('__GARFISH__', true);

  if (fresh) {
    if (__DEV__) {
      if (__VERSION__ !== window['Garfish'].version) {
        warn(
          'The "garfish version" used by the main and sub-applications is inconsistent.',
        );
      }
    }
  }
  return window['Garfish'];
}

export { interfaces } from '@garfish/core';
export { Garfish } from '@garfish/core';
export default createContext();
