1. 立即执行函数 IFEE  
()(), 第一个括号将内部作为表达式, 第二个括号, 则是执行函数, 可以在第二个括号内传入参数, 第一个括号内函数执行时, 使用该参数
(function(){})() //该函数一经定义立即执行
(function(){}())
(function(){}.call(this))
(function(){}).call(this)

> 当圆括号出现在匿名函数的末尾想要调用函数时，它会默认将函数当成是函数声明。  
  当圆括号包裹函数时，它会默认将函数作为表达式去解析，而不是函数声明。

作用js 多个文件之间互不影响, 不会存在命名冲突, 后面的把前面的覆盖掉

2. duck-type 鸭式类型, 不是继承与类或者特定的接口, 只是由当前的方法和属性的集合决定
类数组如, 我自己的理解
    
var arrLike = {
1: 'xiaoshier',
age: 20,
length: 2
}

4. 闭包函数: 有权访问另一个函数作用域中的变量的函数
    闭包是可以访问其他函数内部变量的函数, 一般是其他函数返回的函数
    闭包也是个对象, 是由函数和创建该函数的环境组成,  
    闭包可以'记忆'它被创建时的环境,  
    常见的形式有一个函数包含另一个匿名函数, 并且返回这个匿名函数  

5. 匿名函数的执行环境是全局环境,其中的 this 指全局对象
6. 函数作用域链和执行环境

    某个函数被调用时, 会创建执行环境, 命名参数和 arguments 初始化函数的*活动对象*

7. 活动对象

8. 函数调用 funName()();
    ```javascript
    var func = function(key) {
        return function(obj) {
            return obj == null? void 0 : obj[key];
        }
    }

    var obj = {name: 'xiaoshier', age: 20};
    func(key)(obj); =>'xiaoshier'
    ```



9. underscorejs 中的 invoke 方法, 使用了 value[method]
    
    arr = [1, 9, 19, 10];
    arr['sort'].apply(arr);
    等价于 arr.sort();

       _.invoke = function(obj, method) {
        var args = slice.call(arguments, 2);//获得传入第2个之后面的参数
        var isFunc = _.isFunction(method);
        return _.map(obj, function(value) {
            var func = isFunc ? method : value[method];
            //如果不是函数, 则调用 value 的 method 方法,
            // eg: value 是个数组, method 的值是 sort, 那么 value[sort] 是数组封装好的函数,
            // 在调用时使用 value[method].apply(value),即可
            return func == null ? func : func.apply(value, args);
        });
    };

    value[method]; 会去调用原型上的方法, 如果这个方法存在, 返回这个方法, 如果不存在, 返回 undefined
    
    eg: var arr = [1, 3, 2, 5];
    method = 'sort';
    var value; 或者 value = [];
    value[method] => 返回一个函数
    value[method].call(arr); => 返回重排后的数组

    eg: method = 'sort';
    var value = {};
    value[method] => undefined
    
10. return [expression]; 终止函数, 返回一个指定值, 遇见 return 后, 函数结束
    若无[ expression ] 返回 undefined

    return
    x + y;

    等价于
    return;
    x + y;

11. slice(begin[, end]) 浅复制一个数组, 返回一个新的数组, 包含 begin, 不包含 end
12. for 循环复制数组, 是值赋值, 两个再无关系
    
    var arr1 = [1, 2, 3, 4];
    var arr2 = [];
    for (var i = 0, length = arr1.length; i < length; i++) {
        arr2[i] = arr1[i]; //此处是把 arr1[i]中的值, 传递给arr2[i], arr1 和 arr2 是两个不相干的数组
    }

13. 变量提升

- js 解析器在解析 js 代码时, 会先将变量和函数预编译一遍, 将变量和函数提升至函数最前面, 而变量和函数在解析前, 先解析变量,
只是将变量的标识符提升, 不将变量的值一块儿提升, 然后是解析函数, 如果函数与变量有重命名的情况下, 函数会覆盖变量, 函数声明会
把函数一起提升, 也就是在函数定义之前, 可以调用函数, **js 解析器在执行阶段, 遇见函数声明时会跳过, 不再进行解析,**
- 函数自身内部也存在变量提升, 原理同上


        a(); => something
        var a = 10;
        function a(){
            console.log('something')
        };
        console.log(a); => 10;


        函数内部也同样存在变量提升
        var bar = 'foo';
        funtion foo(){
            console.log(bar);
            var bar = 'bar';
        }
        foo(); => undefined;

14. 对象
- 对象是一些无序的属性的集合, 属性的值可以是原始类型, 也可以是引用类型
- 创建对象

1. 可以是对象字面量的方式, 也可以是创建 Object 实例的方式

        var obj = {
            name: 'xiaoshier',
            age: 20,
            alertName: function(){
                alert(this.name);
            }
        }

        var obj2 = new Object();
        obj2.name = 'xiaoshier';
        obj2.age = 20;
        obj2.alertName = function(){
            alert(this.name);
        }


2. 使用其他方式, 创建格式相同的对象

- 构造函数
            
        function Person() {
            this.name = 'xiashier';
            this.age = 20;
            this.alertName = function() {
                alert(this.name);
            }
        }

    构造函数通过函数创建一个对象的属性和方法, 通过创建构造函数的实例(通过 `new`关键字来创建一个新的对象), 来达到创建对象  
    构造函数创造对象, 新建的构造函数的实例的这个对象, 会重新创建构造函数中的属性和方法,  
    使得方法不能复用, 每个对象都有一个方法的函数, 造成内存浪费等等  


- 原型

    每个函数都有一个原型属性, 这个属性是指向原型对象的指针  
    可以通过在原型上创建属性和方法, 达到对象实例共享这些属性和方法  
    构造函数有个属性 `prototype` 指向原型对象, 原型对象有个 `contructor`属性, 指向构造函数  
    实例有个内部属性 [[prototype]] 指向原型对象; 现代浏览器可以通过 `__proto__` 方法访问原型对象  
    如果在创建实例后重新定义原型, 那么原来的实例, 无法指向新创建的原型
        

        function Person() {}
        Person.prototype = {
            constructor: Person,
            name: 'dada'
        }
        var person1 = new Person();
        person1.name => dada
        //此处 Person 的 prototype 指针指向了一个新的对象(还记得创建对象有字面量的方法么)  
        Person 的创建了一个新的原型对象, 之前的实例 person1 的原型还是原来的
        Person.prototype = {
            constructor: Person,
            name: 'xiaoshier'
        }
        person1.name => dada

    原生引用类型的原型(Array, Function, String, Number), 原生对象也是按照构造函数,
    加原型创建的, 都是在 Object() 的基础上创建构造函数, 不同的引用类型, 重写了 Object 的某些方法  
    如 toString等

    缺点: 对象实例, 共享原型上的属性和方法, 如果属性的值是引用类型, 那么任意一个实例修改该属性的值,
    其他实例的该值也发生了变化  
    原型无法传递参数


        function Person() {};
        Person.prototype.name = 'xiaoshier';
        Person.prototype.age = 20;
        Person.prototype.alertName = function() {
            alert(this.name);
        }

- 构造函数结合原型
    
    一般用构造函数创建属性, 用原型创建方法, 实例调用方法时, 只不过是指向该方法的指针  
    通过构造函数来创建公用属性, 属性值可以是基本类型, 也可以是引用类型, 实例更改引用类型值时,
    不会对其他实例造成影响, 因为实例之间是一个独立的对象

- 寄生构造函数(创建实例中的方法是他们各自的方法, 没能做到函数复用, 效率降低, 与构造函数类似)

    封装一个函数, 该函数创建一个新对象, 给这个对象添加属性和方法, 并返回这个对象  
    仍然使用 `new` 来创建新的对象, 但实例和构造函数之间无关系

        function Person( name ) {
            var o = new Object();
            o.name = this.name;
            return o;
        }
        var person1 = new Person('xiaoshier');

- 稳妥构造函数



15. bind  func.bind(thisArg[, args1[, ...]]) 传递 `this` 值, 返回函数

16. call 和 apply 

func.call(thisArg[, args1[, ...]]), func.apply(thisArg[, [args1, args2, ...]])传递 `this` 值, 并直接调用函数


17. setTimeout(fn, time) 

异步执行函数, 调用setTimeout时，把函数参数，放到事件队列中。等主程序运行完，再调用。  
过 time 时间后, 把 fn 事件放入实践队列中,  
若事件队列中为空时,执行 fn;  
如果事件队列不为空, 那就等事件队列执行完毕后, 再执行 fn

    for (var i = 0; i < 3; i++) {
        setTimeout(function() {
                console.log(i);
                }, 0);
        console.log(i);
    }
    0, 1, 2, 3, 3, 3

等价于

    var i = 0;
    setTimeout(function() {
            console.log(i);
            }, 0);
    console.log(i);
    i++;
    setTimeout(function() {
            console.log(i);
            }, 0);
    console.log(i);
    i++;
    setTimeout(function() {
            console.log(i);
            }, 0);
    console.log(i);
    i++;


18. 枚举一个对象所有属性
引用类型自己封装的属性, 均是不可枚举属性 

- for ... in 依次访问一个对象及其原型链中可枚举的属性
- Object.keys(obj) 返回访问 obj 中不包含原型中的所有属性名称的数组
- Object.hasOwnPropertyNames(obj) 返回一个包含 obj 自己拥有的属性名称的数组


19. 浅拷贝 深拷贝

浅拷贝是内存地址的拷贝, 拷贝对象和源对象的指针 指向同一个存储空间
深拷贝是把值进行拷贝, 拷贝对象和源对象有各自独立的内存地址
