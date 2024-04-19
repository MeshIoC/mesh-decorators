import assert from 'assert';
import { Mesh } from 'mesh-ioc';

import { createMemberDecorator, findMembers, invokeMethods } from '../../main/index.js';

const foo = createMemberDecorator('foo');

class ServiceA {
    @foo() sayHello() {
        return 'Hello A';
    }
}

class ServiceB {
    @foo() hi() {
        return 'Hello B';
    }
}

class SubServiceB extends ServiceB {
    @foo() bye() {
        return 'Bye B';
    }
}

describe('member decorators', () => {

    describe('findMembers', () => {

        it('returns references for nested meshes recursively', () => {
            const parent = new Mesh();
            parent.service(ServiceA);
            const child = new Mesh('Child', parent);
            child.service(ServiceB);
            const fooRefs = findMembers('foo', child);
            assert.strictEqual(fooRefs.length, 2);
            assert.strictEqual(fooRefs[0].target.constructor.name, 'ServiceB');
            assert.strictEqual(fooRefs[0].memberName, 'hi');
            assert.strictEqual(fooRefs[1].target.constructor.name, 'ServiceA');
            assert.strictEqual(fooRefs[1].memberName, 'sayHello');
        });

        it('returns child references when recursive = false', () => {
            const parent = new Mesh();
            parent.service(ServiceA);
            const child = new Mesh('Child', parent);
            child.service(ServiceB);
            const fooRefs = findMembers('foo', child, false);
            assert.strictEqual(fooRefs.length, 1);
            assert.strictEqual(fooRefs[0].target.constructor.name, 'ServiceB');
            assert.strictEqual(fooRefs[0].memberName, 'hi');
        });

        it('returns inherited and implementation references when child is m', () => {
            const mesh = new Mesh();
            mesh.service(SubServiceB);
            const fooRefs = findMembers('foo', mesh);
            assert.strictEqual(fooRefs.length, 2);
            assert.strictEqual(fooRefs[0].target.constructor.name, 'SubServiceB');
            assert.strictEqual(fooRefs[0].memberName, 'hi');
            assert.strictEqual(fooRefs[1].target.constructor.name, 'SubServiceB');
            assert.strictEqual(fooRefs[1].memberName, 'bye');
        });

        it('returns inherited and implementation references when child is bound to parent', () => {
            const mesh = new Mesh();
            mesh.service(ServiceB, SubServiceB);
            const fooRefs = findMembers('foo', mesh);
            assert.strictEqual(fooRefs.length, 2);
            assert.strictEqual(fooRefs[0].target.constructor.name, 'SubServiceB');
            assert.strictEqual(fooRefs[0].memberName, 'hi');
            assert.strictEqual(fooRefs[1].target.constructor.name, 'SubServiceB');
            assert.strictEqual(fooRefs[1].memberName, 'bye');
        });

    });

    describe('invokeMethods', () => {

        it('invokes decorated methods', () => {
            const parent = new Mesh();
            parent.service(ServiceA);
            const child = new Mesh('Child', parent);
            child.service(ServiceB);
            const res = invokeMethods('foo', child);
            assert.strictEqual(res.length, 2);
            assert.strictEqual(res[0], 'Hello B');
            assert.strictEqual(res[1], 'Hello A');
        });

        it('invokes child-only methods when recursive = false', () => {
            const parent = new Mesh();
            parent.service(ServiceA);
            const child = new Mesh('Child', parent);
            child.service(ServiceB);
            const res = invokeMethods('foo', child, false);
            assert.strictEqual(res.length, 1);
            assert.strictEqual(res[0], 'Hello B');
        });

    });

});
