import assert from 'assert';
import { Mesh } from 'mesh-ioc';

import { createMemberDecorator, findMembers, invokeMethods } from '../../main/index.js';

const hello = createMemberDecorator('hello');

class ServiceA {
    @hello() sayHello() {
        return 'Hello A';
    }
}

class ServiceB {
    @hello() hi() {
        return 'Hello B';
    }
}

describe('member decorators', () => {

    describe('findMembers', () => {

        it('returns references for nested meshes recursively', () => {
            const parent = new Mesh();
            parent.service(ServiceA);
            const child = new Mesh('Child', parent);
            child.service(ServiceB);
            const helloRefs = findMembers('hello', child);
            assert.strictEqual(helloRefs.length, 2);
            assert.strictEqual(helloRefs[0].target.constructor.name, 'ServiceB');
            assert.strictEqual(helloRefs[0].memberName, 'hi');
            assert.strictEqual(helloRefs[1].target.constructor.name, 'ServiceA');
            assert.strictEqual(helloRefs[1].memberName, 'sayHello');
        });

        it('returns child references when recursive = false', () => {
            const parent = new Mesh();
            parent.service(ServiceA);
            const child = new Mesh('Child', parent);
            child.service(ServiceB);
            const helloRefs = findMembers('hello', child, false);
            assert.strictEqual(helloRefs.length, 1);
            assert.strictEqual(helloRefs[0].target.constructor.name, 'ServiceB');
            assert.strictEqual(helloRefs[0].memberName, 'hi');
        });

    });

    describe('invokeMethods', () => {

        it('invokes decorated methods', () => {
            const parent = new Mesh();
            parent.service(ServiceA);
            const child = new Mesh('Child', parent);
            child.service(ServiceB);
            const res = invokeMethods('hello', child);
            assert.strictEqual(res.length, 2);
            assert.strictEqual(res[0], 'Hello B');
            assert.strictEqual(res[1], 'Hello A');
        });

        it('invokes child-only methods when recursive = false', () => {
            const parent = new Mesh();
            parent.service(ServiceA);
            const child = new Mesh('Child', parent);
            child.service(ServiceB);
            const res = invokeMethods('hello', child, false);
            assert.strictEqual(res.length, 1);
            assert.strictEqual(res[0], 'Hello B');
        });

    });

});
