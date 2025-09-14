import { Mesh } from 'mesh-ioc';

export interface ClassRef<M> {
    target: any;
    metadata: M;
}

export const globalClassRefMap = new Map<string, Array<ClassRef<any>>>();

/**
 * Creates a decorator that tracks references to a particular class in a global map.
 * These class references can be subsequently accessed via `findClasses`.
 */
export function createClassDecorator<M = void>(decoratorName: string) {
    return function decorator(metadata: M) {
        return (target: any) => {
            const handlers = globalClassRefMap.get(decoratorName) || [];
            globalClassRefMap.set(decoratorName, handlers);
            handlers.push({ target, metadata });
        };
    };
}

export function getClassRefs<M>(decoratorName: string): Array<ClassRef<M>> {
    return globalClassRefMap.get(decoratorName) || [];
}

/**
 * Obtains a list of member references decorated by specified `decoratorName`.
 *
 * For each reference, the `target` is the actual instance of the class created by specified `mesh`.
 */
export function findClasses<T>(decoratorName: string, mesh: Mesh, recursive = true): Array<ClassRef<T>> {
    const result: Array<ClassRef<T>> = [];
    const refs = getClassRefs<T>(decoratorName);
    const bindings = recursive ? mesh.allBindings() : mesh.bindings.entries();
    for (const [key, binding] of bindings) {
        if (binding.type === 'service') {
            for (const { target, metadata } of refs) {
                if (target === binding.class || Object.prototype.isPrototypeOf.call(target, binding.class)) {
                    result.push({
                        target: mesh.resolve(key),
                        metadata,
                    });
                }
            }
        }
    }
    return result;
}
