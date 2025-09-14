import { Mesh } from 'mesh-ioc';

export interface MemberRef<M> {
    target: any;
    memberName: string;
    metadata: M;
}

export const globalMemberRefMap = new Map<string, Array<MemberRef<any>>>();

/**
 * Creates a decorator that tracks references to a particular class property or method in a global map.
 * These member references can be subsequently accessed via `findMembers`.
 */
export function createMemberDecorator<M = void>(decoratorName: string) {
    return function decorator(metadata: M) {
        return (target: any, memberName: string) => {
            const handlers = globalMemberRefMap.get(decoratorName) || [];
            globalMemberRefMap.set(decoratorName, handlers);
            handlers.push({
                target: target.constructor,
                memberName,
                metadata,
            });
        };
    };
}

/**
 * Obtains a list of member references decorated by specified `decoratorName`.
 *
 * For each reference, the `target` is the actual instance of the class created by specified `mesh`.
 */
export function findMembers(decoratorName: string, mesh: Mesh, recursive = true): Array<MemberRef<any>> {
    const result: Array<MemberRef<any>> = [];
    const refs = globalMemberRefMap.get(decoratorName) || [];
    const bindings = recursive ? mesh.allBindings() : mesh.bindings.entries();
    for (const [key, binding] of bindings) {
        if (binding.type === 'service') {
            for (const { target, memberName, metadata } of refs) {
                if (target === binding.class || Object.prototype.isPrototypeOf.call(target, binding.class)) {
                    result.push({
                        target: mesh.resolve(key),
                        memberName,
                        metadata,
                    });
                }
            }
        }
    }
    return result;
}

/**
 * Convenience method to call all methods decorated with specified `decoratorName`.
 *
 * The order of results is generally not defined as decorators are called in the order the modules are imported.
 */
export function invokeMethods(decoratorName: string, mesh: Mesh, recursive = true, ...args: any[]) {
    const members = findMembers(decoratorName, mesh, recursive);
    const results = members.map(ref => ref.target[ref.memberName](...args));
    return results;
}
