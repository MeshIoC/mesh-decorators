# Mesh Decorators

Small framework for creating custom decorators for use with [Mesh IoC](https://github.com/MeshIoC/mesh-ioc).

## Usage

```ts
import { createMemberDecorator, findMembers, invokeMethods } from 'mesh-decorators';

// 1. Create a decorator to track "init" methods
const init = createMemberDecorator('init');

class FooService {

    // 2. Decorate members of the classes (can apply to methods and/or properties)
    @init()
    async setup() { /* ... */}

}

// 3. Bind the service(s) to a mesh
const mesh = new Mesh();
mesh.service(FooService);

// 4. Get all references to members decorated with @init
const initHandlers = findMembers('init', mesh);
// [{ target: <instance of FooService>, memberName: 'setup' }]

// 5. Invoke all @inmit methods
await Promise.all(invokeMethods('init', mesh));
```

## License

[ISC](https://en.wikipedia.org/wiki/ISC_license) © Boris Okunskiy
