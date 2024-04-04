import { Mesh } from 'mesh-ioc';

export interface MemberRef {
    target: any;
    memberName: string;
}

export const globalMemberRefMap = new Map<string, MemberRef[]>();

/**
 * Creates a decorator that tracks references to a particular class property or method in a global map.
 * These member references can be subsequently accessed via `findMembers`.
 */
export function createMemberDecorator(decoratorName: string) {
    return function decorator() {
        return (target: any, memberName: string) => {
            const handlers = globalMemberRefMap.get(decoratorName) || [];
            globalMemberRefMap.set(decoratorName, handlers);
            handlers.push({
                target: target.constructor,
                memberName,
            });
        };
    };
}

/**
 * Obtains a list of member references decorated by specified `decoratorName`.
 *
 * For each reference, the `target` is the actual instance of the class created by specified `mesh`.
 */
export function findMembers(decoratorName: string, mesh: Mesh, recursive = true): MemberRef[] {
    const result: MemberRef[] = [];
    const refs = globalMemberRefMap.get(decoratorName) || [];
    const bindings = recursive ? mesh.allBindings() : mesh.bindings.entries();
    for (const [key, binding] of bindings) {
        if (binding.type === 'service') {
            for (const { target, memberName } of refs) {
                if (target === binding.class || target.isPrototypeOf(binding.class)) {
                    result.push({
                        target: mesh.resolve(key),
                        memberName,
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
