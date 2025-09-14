import assert from 'assert';
import { Mesh } from 'mesh-ioc';

import { createClassDecorator, findClasses } from '../../main/index.js';

const bar = createClassDecorator('bar');

@bar()
class ServiceA {
    sayHello() {
        return 'Hello A';
    }
}

@bar()
class ServiceB {
    hi() {
        return 'Hello B';
    }
}

class SubServiceB extends ServiceB {
    bye() {
        return 'Bye B';
    }
}

describe('class decorators', () => {

    describe('findClasses', () => {

        it('returns references for nested meshes recursively', () => {
            const parent = new Mesh();
            parent.service(ServiceA);
            const child = new Mesh('Child', parent);
            child.service(ServiceB);
            const barRefs = findClasses('bar', child);
            assert.strictEqual(barRefs.length, 2);
            assert.strictEqual(barRefs[0].target.constructor.name, 'ServiceB');
            assert.strictEqual(barRefs[1].target.constructor.name, 'ServiceA');
        });

        it('returns child references when recursive = false', () => {
            const parent = new Mesh();
            parent.service(ServiceA);
            const child = new Mesh('Child', parent);
            child.service(ServiceB);
            const barRefs = findClasses('bar', child, false);
            assert.strictEqual(barRefs.length, 1);
            assert.strictEqual(barRefs[0].target.constructor.name, 'ServiceB');
        });

        it('returns inherited and implementation references when child is bound to parent', () => {
            const mesh = new Mesh();
            mesh.service(ServiceB, SubServiceB);
            const barRefs = findClasses('bar', mesh);
            assert.strictEqual(barRefs.length, 1);
            assert.strictEqual(barRefs[0].target.constructor.name, 'SubServiceB');
        });

    });

});
