### 注释标记含义
!!!: 看懂了, 再继续看几遍
???: 未看懂
!??: 半懂不懂

### 三个调用函数的区别在哪里
1. (function(){}.call(this));
2. (function(){})();
3. (function(){}());

### 了解一下方法
1. keys;
    获得数组或对象的key值,并返回数组,数组的key值是['0', '1',...]

    Object.keys(param);
2. bind;
3. isArray;
4. instanceof;
    object instanceof constructor
    object 要检测的对象 constructor 某个构造函数
    用来检测某个构造函数的 constructor.prototype 是否存在于 object 的原型链上
5. typeof 操作符
    检测给定变量的数据类型,值有 `undefined`, `object`, `boolean`, 'string', `number`, `function`
    
6. 获取数组长度
    
    ```
        var arr1 = [1, 2, 3, 4];
        console.log(arr1.length);
        console.log(arr1['length']);
    
    ```
    输出的值都是4
7. MATH.pow(num, power); num 的 power 幂次方
8. [void 0][1] 
    
    值为 `undefined` ,void 是关键字,获取的值是不可以被 overwrite,
    而 `undefined` 非关键字或保留字,是可以被赋值的, `var undefined = 'I'm not underfined now`(部分浏览器undefined可以赋值),
    那个`void 0`的`0`可以是任意值,但一般习惯写成`0`

    javascript: uri, 浏览器会对':'进行计算, 页面将只会显示 uri 计算出来的值, 当结果是 undefined 的时候, 页面内容才不会受影响
    此时使用 void(), 因为 void(expression) 的值为undefined
    <a href="javascript: void(ducoment.body.style.backgroundColor='green')">
    
9. `null`和`undefined`
    
    `null`表示一个空对象指针,用`typeof`检测是返回`object`,在声明对象而没有确切的值时,应初始化为`null`,
    这样在做变量是否保存了一个对象的引用时,可以与`null`进行比较判断
    ```
        var obj = null;
        obj = {};
        if (obj != null) {
            console.log('it\'s not a null pointer')
        }
        输出it's not a null pointer
    ```
    `undefined`是声明变量时没有初始化,该变量的值为`undefined`,
    而未声明的对象,用`typeof`检测时,返回值也是`undefined`,该`undefined`的意义和声明未初始化的`undefined`不同,
    为了避免混淆,一般习惯声明对象时,就进行初始化

    Boolean(null == undefined) => true;

10. Math.floor() 向下获取整数,Math.ceil() 向上去整数 Math.random() 随机获取0 <= x < 1的值
11. indexOf(obj, item)
    获取item在obj中的索引值

12. arguments 
    
    是一个类数组对象, 代表函数传入的参数列表, 可以通过 arguments.length 获得传入参数的长度,类数组对象, 不包含数组的属性

13. Object.create(proto, args)

    创建一个以proto为原型, args属性的对象

14. Array.prototype.slice(arguments, n)

    将 arguments 转为数组该数组是执行 slice 方法后得到的值, 具备数组的属性和方法
    
    slice(), 不传递参数, 返回数组全部值
    
15. fun.apply(thisArg[, args])

    将 this 指向thisArg, 并把 args 参数传递给 fun 函数
    
16. 逻辑 || 通过逻辑或给变量赋值

    var name =  a || 'b';
    如果 a 不存在, name 的值为 'b';

17. toString();

    [object Object],[object Array],[object Function],[object String],[object Error],[object RegExp],[object Date],[object Arguments], [object Boolean]
    得到引用类型的对象, 是那种类型, 如 object , array, function等
    返回结果如下 [object Object], [object Array]...


18. !! 

    var obj = 11;
    var getObjBoolean = !!obj;
    通过 `!!` 求得变量对应的布尔值, 与 Boolean(obj) 的结果一致

19. NaN 是一个不等于自己的数值 NaN is the number which is not equal itself;
    
[1]: http://stackoverflow.com/questions/7452341/what-does-void-0-mean
[1]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/void
