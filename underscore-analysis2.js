// read underscore.js the second time in the 2016-1-31


(function() {

}.call(this));
//this 在 浏览器中指 window 对象, 在 node 中指 global 对象; 将 this 传递给 function 函数
//(function(){}.call(this)) 函数立即执行
//等同于(function(){}).call(this)

//函数定义时传递参数, 解析
//predicate 判断函数, 返回布尔值
//iteratee 执行函数


(function(){

  //this 是通过 call(this) 传递进来的
  //浏览器中指 window
  var root = this;

  //保存之前版本的 _ 对象,
  //_ 是 this 的一个属性
  // 保存之前使用的 root._ 到变量 previousUnderscore, 为防止下面定义属性方法, 把 `_` 覆盖
  // 也就是说, 如果还有其他的框架使用了 `_`, 那么就把他的属性方法, 保存至变量,
  // 防止`_`冲突
  //   _.noConflict = function() {
  //      root._ = previousUnderscore;
  //      return this;
  //  }

  var previousUnderscore = root._;

  //保存数组, 对象, 函数的原型, 以便简化使用
  var ArrayProto = Array.prototype,
    ObjectProto = Object.prototype,
    FuncProto = Function.prototype;

  //原型上的方法, 调用方式都是 Object.prototype.toString.call(obj); 这种方式
  var
  push = ArrayProto.push,
    slice = ArrayProto.slice,
    toString = ObjectProto.toString,
    //获取传入参数是属于那种引用类型
    //调用方法 toString.call(obj); Object.prototype.toString.call(obj);
    //返回值为 [object Object], [object Array]...
    hasOwnProperty = ObjectProto.hasOwnProperty;


  var
  nativeIsArray = Array.isArray,//检测是否为数组 Array.isArray(value)
    nativeKeys = Object.keys,//Object.keys(obj)
    nativeBind = FuncProto.bind,//绑定函数的 this 值, bind(thisArg[, arg1[, arg2[, ...]]]), 返回一个函数
    nativeCreate = Object.create;//创建一个有指定原型和属性的对象Object.create(ptototype[, properties])

  var Ctor = function(){};

  //创建构造函数
  //在使用面向对象调用方法时, _(obj).map(iteratee)
  var _ = function(obj) {
    //检测 obj 是否是用户自己使用 new 新建的对象
    if (obj instanceof _) return obj;//如果 obj 是 _ 的实例, 直接返回 obj
    //如果用户没有通过 new 新建实例, 则返回一个使用 new 新建的对象
    //这样生成实例, 可以不用 new
    if (!(this instanceof _)) return new _(obj);
    //把传进的参数, 赋值给 this._wrapped 在_.mixin(_) 中使用到了该属性
    //保存 obj 参数的值
    this._wrapped = obj;
  }


  //将 _ 暴露给 export 或者 window
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    //root = this
    //root._ = _
    //this._ = _
    //this 在 浏览器中是 window 对象, 所以可以直接使用 _.method
    root._ = _;
  }

  _.VERSION = '1.8.3';



  //闭包函数
  //优化函数func, 确定函数的 this 值, 以及扩展形参个数
  var optimizeCb = function(func, context, argCount) {
    if (context === void) {
      return func;
    }

    switch (argCount == null ? 3 : argCount) {
      case 1: return funtion(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    //什么时候会执行此代码???
    return function() {
      return func.apply(context, arguments);
    };
  };


  //返回一个函数
  //如果 value 是函数, 则返回该函数
  //如果 value 是对象, 则返回一个 obj 是否有该 value 的判断函数
  //如果 value 是字符串, 则返回一个获取该 value 对应的属性值的函数
  //如果 value 为 null, 则返回一个返回该 value 值的函数
  //identity: 同一性, 身份, 一致
  var cb = function(value, context, argCount) {
    /*
     *_.identity = function(value) {
     *    return value;
     *};
     */
    //返回一个函数, 返回 value 值
    if (value == null) return _.identity;
    //返回一个函数, 将 this 指向 context 的函数
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    /*
     *         返回一个函数, 该函数调用判断函数 isMatch(),
     *         用来判断 obj 中是否有 attrs 中的值
     *        _.matcher = _.matches = function(attrs) {
     *            attrs = _.extendOwn({}, attrs);
     *            return function(obj) {
     *                return _.isMatch(obj, attrs);
     *            };
     *        };
     *
     *        判断 obj 中是否有与 attrs 的属性与值相同的项
     *        _.isMatch = function(object, attrs) {
     *            var keys = _.keys(attrs), length = keys.length;
     *            if (object == null) return !length;
     *            var obj = Object(object);
     *            for (var i = 0; i < length; i++) {
     *                var key = keys[i];
     *                if (attrs[key] !== obj[key] || !(key in obj)) return false;
     *            }
     *            return true;
     *        };
     *
     */

    //返回一个判断函数, function(obj) {}; 判断 obj 中是否包含 value 值
    if (_.isObject(value)) return _.matcher(value);//返回一个判断函数, 判断 value 是否是 obj 的值

    /*
     *        获得 value 的属性值
     *        _.property = function(key){
     *            return function(obj) {
     *                return obj == null ? void 0 : obj[key];
     *
     *            }
     *        }
     */
    //返回一个函数, 获得 value 对应的值
    return _.property(value);
  };
  // iterate: 重定向, 迭代
  // 创建一个函数, 不同的 value 和 context 值, 返回不同形式的对象
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };


  //闭包函数
  //创建一个分配函数,
  //每个传入的参数, 执行 keysFunc 函数, 获得函数返回值,
  //再根据返回值, 对 obj 进行取值赋值, 返回新生成的 obj 对象
  //assigner: 指定人, 分配人
  //eg:
  //_.extend = createAssigner(_.keys);
  //_.extend({name: 'loe'}, {age: 20}) => {name: 'loe', age: 20}
  createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 0; index < length; index++) {
        var source = arguments[index],
          keys = keysFunc(source),
          l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  //Object.create(), 函数定义
  //创建一个有指定原型的对象
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  //创建一个获取 key 对应的属性值的函数, 返回传递获取对象参数的函数
  //_.property = property
  //eg:
  //var obj = {name: 'xiaoshier', age: 20};
  //_.property(name)(obj); => 'xiaoshier'
  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;//浏览器的最大数值
  var getLength = property('length');//获得长度对应的值
  //判断是否是类数组,如函数的参数 arguments, 和 获取 DOM, 返回的类数组对象
  //只有有数组的 length 属性, 但是没有数组的其他属性
  //var arrLike = {1: 'xiaoshier', 2: '20', length: 2}
  var isArrayLike = function(collection) {
    var length = getLength(collection);//传递要获取长度的对象, 返回长度值
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };



  //Collection Functions
  //--------------------

  //集合对象的函数, 需要考虑是对象, 还是数组, 将其分别进行处理

  //对数组/对象的每个值进行 iteratee 操作, 并返回 obj 对象
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (var i = 0; i < length; ++i) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0; i < length; ++i) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  //看了 _.map 的实现形式, 认为 _.each 也可以按照此方法实现
  //不知是否正确,下次读源码时, 再次确认
  //采用类似 _.map 的实现形式实现 _.each
  /*
   *_.each = function(obj, iteratee, context) {
   *    iteratee = cb(iteratee, context);
   *    var keys = !isArrayLike(obj) && _.keys(obj),
   *        length = (keys || obj).length;
   *    for (var i = 0; i <  length; ++i) {
   *        var currentKey = keys ? keys[i] : i;
   *        iteratee(obj[currentKey], currentKey, obj);
   *    }
   *    return obj;
   *};
   */


  //对数组/对象的每个值进行 iteratee 操作, 返回iteratee 函数返回值的集合
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
      length = (keys || obj).length,
      result = Array(length);
    for (var i = 0; i <  length; ++i) {
      var currentKey = keys ? keys[index] : i;
      result[i] = iteratee(obj[currentKey], currentKey, obj);
    }
    return result;
  }


  function createReduce(dir) {
    function iterator(obj, iteratee, memo, keys, index, length) {
      //循环执行 iteratee 函数, 并将函数返回值赋值给 memo, 最后返回一个值 memo;
      for (; index >=0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        //把 iteratee 函数的返回值赋值给 memo
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      //获取 keys, index, length 的值
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        index = dir > 0 ? 0 : length -1;

      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      //把 keys, index, length 传入 iterator 函数
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  //将初始值, 与 obj 第一个传入函数 iteratee, 返回的值, 依次与 obj 剩下的值传入函数, 最后返回最后一个值传入函数的返回值
  //_.reduce(obj, iteratee, mome, context);
  //将 memo 当做初始值, 与 obj[0], 传入 iteratee, 函数返回值再次最为初始值, 继续执行前面的操作,
  //最终返回一个值
  //也就是将对象的每个值, 带入函数中进行操作, 返回操作的结果
  //eg: 初始值 + 累加, 初始值 - 累减等等操作, 初始值未赋值, 默认为 obj 的第一个或最后一个值
  _.reduce = _.foldl = _.inject = createReduce(1);

  _.reduceRight = _.foldr = createReduce(-1);

  /*
   *_.findIndex = createPredicateIndexFinder(1);
   *   function createPredicateIndexFinder(dir) {
   *   //按照判定函数, 遍历 array 中的值, 满足判定函数的返回它的索引值, 退出遍历
   *    return function(array, predicate, context) {
   *        predicate = cb(predicate, context);
   *        var length = getLength(array);
   *        var index = dir > 0 ? 0 : length - 1;
   *        for (; index >= 0 && index < length; index += dir) {
   *            if (predicate(array[index], index, array)) return index;
   *        }
   *        return -1;
   *    };
   *}
   */

  //predicate: 判断, 断定, 这里指的是一个判断函数, 返回 boolean 值
  //返回满足判断函数的第一个值, 否则无返回值, 函数无返回值时默认返回值为 undefined
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
      /*
       *key = function(array, predicate, context ) {
       *    predicate = cb(predicate, context);
       *    var length = getLength(array);
       *    var index = length - 1;
       *    for (; index <  length; ++i) {
       *        if (predicate(array[index], index, array)) return index;
       *    }
       *    return -1;
       *}
       */
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };


  //返回一个数组, 该数组是满足判定函数的值的集合
  _.filter = _.select = function(obj, predicate, context) {
    var result = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    retrun results;
  };



  /*
   *   *_.negate = function(predicate) {
   *  return function() {
   *    return !predicate.apply(this, arguments);
   *  };
   *};
   */

  //返回一个数组, 该数组是不满足断定函数的值的集合
      _.reject = function(obj, predicate, context) {
        return _.filter(obj, _.negate(cb(predicate)), context);
      };


  //返回一个布尔值, 判断 obj 中所有的值是否满足断定函数
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
      length = (keys || obj).length;
    for (var index = 0; index <  length; ++index) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  //返回一个布尔值, 判断 obj 中是否有一个值满足断定函数
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
      length = (keys || obj).length;
    for (var index = 0; index <  length; ++index) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey]), currentKey, obj) return true;
    }
    return false;
  };

  //返回布尔值, 判断 obj 中是否包含 item 的值
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    retrun _.indexOf(obj, item, fromIndex) >= 0;
  };

  //返回一个数组, 满足函数方法的集合
  //执行 method 函数, 参数为 obj
  //对 obj 进行遍历, 每个值作为参数执行 method 函数, 将每个值作为参数执行函数的返回值,集合在一个数组中
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);//获得传入第2个之后面的参数
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      //如果不是自己定义的函数, 则使用调用 value[method] 的形式, 到原型上去查找该方法,
      //如果该方法存在, 返回该属性对应的值, 及一个函数
      //如果不存在返回值是 undefined
      // eg: value 是个数组, method 的值是 sort, 那么 value['sort'] 是数组封装好的方法,
      // 在调用时使用 value[method].apply(value),即可对 value 进行排序

      //如果 func 不存在, 返回 func 的值即 undefiend
      //否则将 value 传入执行该方法
      //func.apply()  等价于 func(value)
      return func == null ? func : func.apply(value, args);
    });
  };


  //返回一个数组, 是 obj 中 属性key 对应值的集合
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };





  /*matcher 返回一个函数, 该函数用来判断 obj 是否包含 attrs 属性
   *_.matcher = _.matches = function(attrs) {
   *    attrs = _.extendOwn({}, attrs);
   *    return function(obj) {
   *        return _.isMatch(obj, attrs);
   *    };
   *};
   * 返回一个布尔值, obj 中是否含有 attrs
   *_.isMatch = function(object, attrs) {
   *    var keys = _.keys(attrs), length = keys.length;
   *    if (object == null) return !length;
   *    var obj = Object(object);
   *    for (var i = 0; i < length; i++) {
   *        var key = keys[i];
   *        if (attrs[key] !== obj[key] || !(key in obj)) return false;
   *    }
   *    return true;
   *};
   *_.filter = _.select = function(obj, predicate, context) {
   *    var result = [];
   *    predicate = cb(predicate, context);
   *    _.each(obj, function(value, index, list) {
   *        if (predicate(value, index, list)) results.push(value);
   *    });
   *    retrun results;
   *};
   */
  //返回一个数组
  //这个数组包含attrs所列出的属性的所有的键 - 值对。
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // 返回匹配 attrs 列出的属性的所有的键 - 值对的第一个值。
  _.findWhere = function(obj, attrs) {
    retrun _.find(obj, _.matcher(attrs));
  };

  //返回一个属性值
  //该属性值满足 iteratee结果中 最大的值
  //或该值是 obj 中属性值中最大的
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
      value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; ++i) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      //将计算结果进行比较, 保存大的对应的 value 值
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list){
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Indinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });

    }
    return result;
  }

  //返回一个值
  //该值是 obj 中满足条件最小的属性对应的值
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
      value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0; i < obj.length; ++i) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list){
        computed = iteratee(value, index, list);
        if (computed < lastComputed) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  }

  //返回一个数组, 值的数组
  //生成随机排序的 obj
  //?????
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0; index <  length; ++index) {
      rand = _.random(0, index);
      if (rand !== index) {
        shuffled[index] = shuffled[rand];
      }
      shuffled[rand] = set[index];

    }
    return shuffled;
  }


  //返回一个随机值, [n 有值的前提,或随机生成的数组]
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) {
        obj = _.values(obj);
      }
      return obj[_.randow(obj.length -1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  }

  //返回一个数组 obj 的拷贝副本,  iteratee 作为排序依据
  //对 obj 进行排序
  //???
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
      //返回一个数组, [{value: obj[0], index: 0, criteria: someValue}, {value: obj[1], index: 1, criteria: someValue}, ...]
    }).sort(function(left, right){//???
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;

    }), 'value');
  };


  //返回一个对象
  //behavior: 行为, 举止, 反应; 此处的函数是添加一个对象的键值对
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);//传递的该函数, 都是按要求生成 result 的键值对
      });
      return result;
    }
  }

  /*
   *    _.groupBy = function(obj, iteratee, context) {
   *        var result = {};
   *        iteratee = cb(iteratee, context);
   *        _.each(obj, function(value, index) {
   *            var key = iteratee(value, index, obj);
   *            var behavior = function(result, value, key){
   *                if (_.has(result, key)) {
   *                    result[key].push(value);
   *                } else {
   *                    result[key] = [value];
   *                }
   *            };
   *            behavior(result, value, key);
   *        })
   *        return result;
   *
   *    }
   *
   */
  //返回一个对象,
  //_.groupBy(obj, iteratee, context)
  //按照 iteratee 执行结果, 返回一个新的对象
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) {
      result[key].push(value);
    } else {
      result[key] = [value];//将 result[key]的赋值为一个数组
    }
  });

  //返回一个对象
  //给定一个list，和 一个用来返回一个在列表中的每个元素键 的iterator 函数（或属性名），
  //返回一个每一项索引的对象。
  //和groupBy非常像，但是当你知道你的键是唯一的时候可以使用indexBy 。
  //若有相同的 iterator 值时, 返回最后一个
  //_.indexBy(obj, iteratee, context);
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });


  //返回一个对象
  //返回各组中的对象的数量的计数
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)){
      result[key]++;
    } else {
      result[key] = 1;
    }
  });

  //返回一个数组
  //转换为数组
  //对象返回 property 值的集合
  _.toArray= function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  //返回参数的长度
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  //返回一个二维数组, 该数组一维长度为2
  //将一个集合分成两个数组, 一个是满足 predicate 的, 一个是不满足
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    }) ;
    return [pass, fail];
  }


  //Array Functions
  //---------------

  //返回一个数组
  //浅复制一个数组, 从第一个开始, 但不包含 n 之后的内容
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length -n);
  };


  //返回一个新的数组
  //浅复制数组第 0 至, 第 length - n 个, 不包含第 length - n 个
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  //返回一个数组, 后 n 项
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length -1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  //返回一个数组, 从第 n 项之后的值
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  //compact: 合同, 紧凑, 简洁
  //剔除数组中 false 的值; 如 undefined, false, ''等
  _.compact = function(array) {
    return _.filter(array, _.identity);
    //_.identity() = function(value){
    // return value;
    //}
  };

  //将一个多维数组, 转为一维数组, 或二维数组(传入 true 值)
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0;, length = getLength(input); i <  length; ++i) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value)) || _.isArguments(value)) {
        //如果shallow值为 false, 递归调用 flatten 函数, 直至 value 不再是数组
        if (!shallow) value = flatten(value, shallow, strict);
        //如果 shallow 值为 true,
        //循环将 value 值复制给 output
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else {
        output[idx++] = value;
      }
    }
    return output;
  };

  //将多维数组, 转为一维, 或者二维
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  _.without = function(array) {
    return _.different(array, slice.call(arguments, 1));
  };

  //返回数组
  //剔除重复项
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0; i < length; ++i) {
      var value = array[i],
        computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        //如果数组已经排序, 保存上一结果与此次进行比较, 不相同则添加至 result 中
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if(iteratee){
        //将此次需要比较的值, 与之前的所有值的集合进行比较 seen 保存之前的所有值
        //若果 seen 中不包含 computed, 将 value 值添加至 result 中
        //将该的结果添加至 seen 中, 为后面继续作比较
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }

      } else if(!_.contains(result, value)){
        //如果 result 中没有 value, 添加至 result 中
        result.push(value);
      }
    }
    return result;
  }

  //将多个数组转为一维数组, 剔除重复项
  //_.union(*arrays);
  _.union = function() {
    //flatten(arguments, true, true), 先将多个数组, 合并成一个一维数组
    //_.uniq(), 把 flatten()返回的数组, 进行去重工作
    return _.uniq(flatten(arguments, true, true));
  };

  //返回一个集合
  //获得所有参数都包含的项
  //_.intersection(*array);
  //那第一个参数的项依次和其他参数进行对比
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; ++i) {
      var item = array[i];
      if (_.contains(result, item)) continue;

      //如果 arguments 中都包含 array[i], 把 array[i] 添加至 result 中
      //判断 所有的 arguments 是否都包含 item, 一旦有不包含的退出循环
      for (var j = 0; j < argsLength; ++j) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  //将array 中不存在与 other 的项剔除出来
  //_.difference(array, *other);
  _.difference = function(array) {
    //将arguments[1]及 arguments[n]个数组合并成一个数组
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  _.zip = function() {
    return _.unzip(arguments);
  };

  //_.unzip([["moe", 30, true], ["larry", 40, false], ["curly", 50, false]]);
  //=> [['moe', 'larry', 'curly'], [30, 40, 50], [true, false, false]]
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;//????? _.max(array, getLength).length
    var result = Array(length);

    for (var index = 0; index <  length; ++index) {
      result[index] = _.pluck(array, index);
      //_.pluck(array, index);
      //_.pluck = function(obj, key) {
      //      return _.map(item, _.property(key));
      //};
      //_.map = function(obj, iteratee) {
      //      for(var i = 0; i < obj.length; i++) {
      //          result[i] = iteratee(value, i, obj);
      //      }
      //      return result[i];
      //}
    }
    return result;
  }

  //将二维数组转为对象
  //[[ele00, ele01],[ele10, ele11]] => {ele00: 'ele01', ele10: 'ele11'}
  //[ele00, ele01, ele02], [ele10, ele11, ele12] => {ele00: 'ele10', ele01: 'ele11', ele02: 'ele12'}
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i <  length; ++i) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  }

  //返回第一个满足 predicate 的项的索引值
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    }
  }

  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  //返回  iteratee(obj) 在 iteratee(array[n]) 中的索引值
  //_.sortedIndex(list, value[, iteratee, context]);
  //查找 value 在 list 的索引值
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      //取中间值, 将中间值与 obj 进行比较,
      //比较中间值小于 obj, 那么 obj 在中间以右, low = mid + 1, 再次取中间值进行比较
      //比较中间值大于 obj, 那么 obj 在中间以左, high = mid, 再次取中间值, 进行比较
      var mid = Math.floor((low + high) /2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };


  //???????
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx){
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if(sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }

      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length -1; idx >= 0 && idx < length; idx +=dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    }
  }

  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);


  //返回一个间隔 step 数组
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop -start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start +=step) {
      range[idx] = start;
    }


    return range;
  }

  //Function Functions
  //------------------

  //?????
  //绑定函数中 this 指代的对象
  var excuteBound = function(sourceFunc, boundFunc, context, callindContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);//创建一个以 sourceFunc 原型对象为原型的对象
    var result = sourceFunc.apply(self, args);//
    if (_.isObject(result)) return result;
    return self;
  }

  //????
  //返回一个函数, 给函数传递 this 值和参数
  //func.apply(thisArgs, args)
  //func.bind(thisArg);
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) threw new TypeError('Bind must be called on a function');
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  }

  //???
  //返回一个函数, 可以用 _ 作为占位符, 代替参数传入函数, 只做占位符使用个
  //比如一个函数需要三个参数, 我只想传第三个参数进去, 那就可以使用 _.partial(_, _, args);
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; ++i) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return excuteBound(func, bound, this, this, args);
    };
    return bound;
  }


  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (var i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  }


  //???????????
  //缓存一个复杂函数的值
  //var temp = _.memoize(func, hasher)
  //temp(key);此处 key 值就是下面的 key 值
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  //延迟执行函数
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  _.defer = _.partial(_.delay, _, 1);


  //返回一个函数

  //开始边界执行的情况
  //直接执行函数
  //如果此次执行时间与上一次执行时间, 间隔大于 wait 时间, 直接执行,
  //如果此次执行时间, 与上一次执行时间间隔 interval 小于 wait 时间, 则过 wait - interval 后执行该函数
  //每 wait 时间内, 只执行一次函数

  //开始边界不执行的情况
  //间隔 wait 时间后执行函数

  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading == false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;

      //第一次执行, 走这里
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;

        //第一次不执行, 间隔 wait 后执行
      } else if(!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  //???????
  //immediate:  true在边界执行函数, false在边界不执行函数
  //
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;// number - undifined = NaN; Boolean(NaN) => false;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }

    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }
      return result;
    };

  };


  //把第一个函数当做参数传给第二个函数
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  //返回一个函数
  //返回判断函数的反值函数
  //返回判断函数的反值
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);//返回判断函数的反值
    }
  };


  //返回一个值
  //f(), h(), g()
  //返回值为f(h(g()))
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);//先 trigger/invoke 最后一个函数
      while (i--) result = args[i].call(this, result);//把上一个函数返回的结果作为参数, 传入下一个函数
      return result;
    };
  };

  //返回一个被调用 times 次才执行的函数
  _.after = function(times, func) {
    return function() {
      if (--time < 1) {
        return func.apply(this, arguments);
      }
    }
  };

  //返回一个函数最多被执行的次数
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  _.once = _.partial(_.before, 2);


  //Object Functions   910 - 1283
  //-----------------


  //`for key in ...`循环遍历, 可枚举属性, 引用类型自行封装的属性为不可枚举属性
  //引用类型封装的属性, ie < 9 的浏览器内定这些属性为不可枚举,
  //即使被重定义, 在使用 `for ... in`时, 这些属性会被忽略
  //其他浏览器则认为重定义的这些属性是可枚举属性
  //不可枚举属性, 可使用 `in`, 但不可使用` for ... in`
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeof', 'toString',
    'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  //检查 ie < 9 中内定的不可枚举属性, 是否被重定义, 若重定义, 将其添加至 keys 中
  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;//指向构造函数
    //如果constructor 是个函数, 那么 proto 是该构造函数的原型
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    //如果 obj 中有自定义属性 constructor, 且检查 keys 里是否包含该属性, 不包含则keys 中添加该属性
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    //遍历检查这些 ie < 9 的不可枚举属性,
    //自定义属性值不等于原型的属性值时,keys 中不包含该属性
    //keys 添加该属性
    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  };


  //返回一个数组, 获取 obj 中自有属性 key 值集合
  //替代原生 js Object.keys(obj);
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) {
      if (_.has(obj, key)) {
        //_.has(obj, key), 检查是否是自己拥有的属性
        keys.push(key);
      }
    }

    //ie < 9 检查引用类型封装的属性, 是否被重写, 被重写, 则把该属性也添加至 keys 中
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  //返回一个数组, 获取 obj 中原型及自有可枚举属性
  _.keysAll = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) {
      keys.push(key);
    }
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };


  //获取对象的属性对应的值
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i <  length; ++i) {
      values[i] obj[keys[i]];
    }
    return values;
  };



  //遍历对象, 返回每个属性执行函数结果的对象
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(itaratee, context);
    var keys = _.keys(obj),
      length = keys.length,
      results = {},
      cuttentKey;
    for (var index = 0; index < length; ++index) {
      currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj)
    }
    return result;
  };


  //返回一个二维数组, 每一项是由 属性名 和属性值组成
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var paris = Array(length);
    for (var i = 0; i < length; ++i) {
      pairs[i] = [keys[i], obj[kyes[i]]];
    }
    return pairs;
  };


  //将对象的属性值和属性名对调
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; ++i) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  //返回一个对象中方法集合的数组
  _.functions = _.method = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) name.push(key);
    }
    return name.sort();
  };


  //将多个对象合并成一个对象, 属性键值对不变
  _.extend = createAssigner(_.allKeys);

  _.extednOwn = _.assign = createAssigner(_.keys);


  //返回第一个满足断定函数的 key 值,
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i <  length; ++i) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  //_.pick(obj, *keys)
  //返回包含白名单的对象的拷贝值
  //返回一个对象, 该对象筛选出obj 中 keys 对应的属性键值对的集合
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optiomizeCb(oiteratee, context);
    } else {
      // 如果 oiteratee 不是函数, 一般是 object 里的属性名
      keys = flatten(arguments, false, false, 1);//将多个数, 合并为一个数组
      iteratee = function(value, key, obj) {
        retrun key in obj;
      };
      obj Object(obj);
    }
    for (var i = 0; i <  length; ++i) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };


  //返回不包含黑名单的对象的拷贝值
  _.omit = function(obj, iteratee, context) {
    if (_isFunction(iteratee)) {
      //判断函数取反
      iteratee = _.negate(iteratee);
    } else {
      //keys = _.map([args1, args2, args3, ...], String), String 是js 基本类型对象, 是个函数
      var keys = _.map(flatten(arguments, false, false, 1), String);

      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };


  //_.default(obj, *defaults)
  //往 obj 添加 defaults 中obj 未定义的属性键值对
  _.default = createAssigner(_.allKeys, true);

  //创建一个对象, 参数为原型及属性值
  _.create = fucntion(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };


  //复制 obj, 返回一个 新对象
  //源码注释说是浅拷贝, 可是都返回的是新对象, 而且是值的拷贝, 个人认为是深拷贝
  _.clone = function(obj) { //如果不是对象, 返回这个 obj 得值
    if (!_.isObject(obj)) return obj;
    //
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };


  //执行函数, 再返回 obj, 链式调用
  _.tap = function(obj, interceptor) {
    interaceptor(obj);
    return obj;
  };

  //判断 attrs 的值是否在 object 中
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    //此处用的很巧妙
    // 如果 object 为空, 返回 attrs 长度的反值,
    // 如果长度为零, 则说明 attrs 也为空, 返回 true
    // 如果 attrs 长度不为了, 那则返回 false
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; ++i) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj))  return false;
    }
    return true;
  };

  var eq = function(a, b, aStack, bStack) {

    if (a === b) return a !== 0 || 1 / a === 1 / b;

    if (a == null || b == null)  return a === b;

    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;

    var className = toString.call(a);
    if (className !== toString.call(b)) return false;

    //比较正则, 字符串, 数值, 布尔类型
    switch (className) {
      case '[object RegExp]':
      case '[object String]':
        return '' + a === '' + b;

      case 'object Number':
        if (+a !== +a) return +b !== +b;
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;

      case '[object Date]':
      case '[object Boolean]':
        return +a === +b;
    }

    var areArrays = className === '[object Array]';

    //比较函数
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      var aCtor = a.constructor, bCtor = a.contructor;
      if (aCtor !== bCtor && !(_.isFUnction(aCtor) && aCtor instanceof aCtor &&
        _.isFunction(bCtor) && bCtor instanceof bCtor)
          && ('constructor' in a && 'constructor' in b)) {
            return false;
          }
    }

    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      if (aStack[length] === a) return bStack[length] === b;
    }

    aStack.push(a);
    bStack.push(b);

    //比较数组和对象
    if (areArrays) {
      length = a.length;
      if (length !== b.length) return false;

      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      var keys = _.keys(a), key;
      length = keys.length;

      if (_.keys(b).length !== length) return false;
      while (length--) {
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }

    aStack.pop();
    bStack.pop();
    return true;
  };

  _.isEqual = function(a, b){
    return eq(a, b);

  };

  //判断是否是空对象
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  //判断是否是数组
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
    //Object.prototype.toString.call(obj) 获得 obj 的引用类型的类型
  };

  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
    //!!obj 获得 obj 的布尔值
    //因为 typeof null => object
  };

  //判断类型的函数
  _.each(['Arguments', 'Function', 'String', 'NUmber', 'Date', 'RegExp', 'Error'], function(name) {

    //_[property] = _.property
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });


  //在 IE < 9 的浏览器, 没有 [object Arguments],
  //所以使用 arguments 才有的属性 `callee` 来判断
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    }
  };


  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    }
  }

  //判断所给 obj 是否是有限数字
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };


  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  _.isNull = function(obj) {
    return obj === null;
  };

  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  //判断 key 是否是 obj 私有属性, 返回布尔值
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };


  //Utitlity Functions  1284 - 1490
  //------------------

  //Give control of the _ variable back to its previous owner.
  //Returns a reference to the Underscore object.
  // 把`_` 的使用权, 让给它之前的拥有者, 然后把`_` 赋值给其他变量,
  //var underscore = _.noConflict();
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  //This function looks useless, but is used throughout Underscore as a default iteratee.
  //作为默认迭代器
  _.identity = function(value) {
    return value;
  };

  //Creates a function that returns the same value that is used as the argument of
  //返回一个函数, 这个函数是一个返回相同值的
  _.constant = function(value) {
    return function() {
      return value;
    }
  };

  //noop: 空
  _.noop = function(){};

  //_.property(key) => function(obj){};
  //返回一个函数, 该函数传递要获取 propety 的对象
  //获得属性值
  _.property = property;


  //_.propertyOf(obj) => function(key) {}
  //返回一个函数, 该函数需要传递 property 的值
  //获得属性值
  _.propertyOf = function(obj) {
    return obj == null ? function() {} : function(key) {
      return obj[key];
    };
  };

  //Returns a predicate function that will tell you if a passed in object contains all of the key/value properties present in attrs.
  //返回一个判断函数, 判断传入的 obj 是否包含attrs键值对
  _.matcher = _.matched = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);//判断 obj 中是否饱饭 attrs 键值对, 返回布尔值
    };
  };

  //运行一个函数 n 次, 返回运行结果
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i <  n; ++i) {
      accum[i] = iteratee(i);
    }
    return accum;
  };

  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };


  _.now = Date.now || function() {
    return new Date(.getTime());
  };



  var escapeMar = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;,
    '`': '&#x60;'
  };

  var unescapeMap = _.invert(escapeMap);

  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };

    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' +string;
      return testRegexp.test(string) ? string.replace(repleceRegexp, escaper) : string;
    };
  };

  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);


  //获得某个属性的值, 如果是方法, 把 object 作为参数来调用这个方法, 返回该方法执行后的值
  //否则返回属性的值
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };


  var idCounter = 0;

  //创建一个唯一个 id
  //用来创建临时 DOM id
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };


  //???
  _.templateSettings = {
    evalute: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%([\s\S]+?)%>/g
  };

  //  ...

  //line1482



  //给一个对象添加链式调用的方法
  //返回这个对象的实例
  //var obj = [1, 2, 3];
  //_.chain(obj) => {_wrapped: Array[3], _chain: true}
  _.chain = function(obj) {
    //创建一个实例
    var instance = _(obj);//instance._wrapped = obj;
    instance._chain = true;
    return instance;
  }





  //Object-oriented programming 面向对象编程
  //OOP               1490??????
  //-----------------
  /*
   *
   * var foo =  _.chain(obj)
   *              .map()
   *              .value();
   */


    //返回对象链式调用方法, 或返回对象本身
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  //调用该库的方式有两种, 一是把 _ 看做函数, 函数调用, _.map(obj, iteratee)
  //二是面向对象调用, new 一个新的对象, 通过对象的方法来调用, _(obj).map(iteratee);
  //_.func = function() {}, _ 的静态函数
  //_.mixin 将 _ 作为构造函数来定义, 将_.func 的每个方法添加到原型上, 原型的函数返回 _.func 函数
  //
  //扩展 underscore 库的 api
  //
  //循环遍历 _ 的静态函数, 将其添加到 _ 构造函数的 prototype 上
  //若链式调用, 则原型的方法值为静态函数调用的结果
  //若非链式调用, 则原型的方法值为返回静态函数
  _.mixin = function(obj) {
    //_.functions(){} 返回一个obj 方法名称的集合
    _.each(_.functions(obj), function(name) {
      //把 obj 的方法赋值给 func
      //给 _ 添加静态方法
      var func = _[name] = obj[name];

      //给_ 添加实例方法
      _.prototype[name] = function() {
        //实例化 _ 时, _(obj) 中有 this._wrapped = obj;
        var args = [this._wrapped];//this._wrapped 是值 obj 对象

        return result(this, func.apply(_, args));
        //如果是链式调用 为 true, _(func.apply(_, args)), 返回 func 函数的结果, 再以此结果作为 obj, 进行链式调用_(obj).chain();

        /*
         *  下面为 return 的解释
         *  return result(this, func.apply(_, args));
         *  =>
         *  var arg = func.apply(_, args);//func 函数的执行结果赋值给 arg
         *  this => 实例中 _(obj) 中的 obj
         *  => function(obj, arg) {
         *    return obj._chain ? _(arg).chain() : arg;
         *  }
         */

      }

    });
  };


  //给每个静态函数添加原型对象
    _.mixin(_);


  //将这些方法与链式调用联系起来
    _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
      var method = ArrayProto[name];
      _.prototype[name] = function() {
        var obj = this._wrapped;
        method.apply(obj, arguments);
        if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
        return result(this, obj);
      };
    });

  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  _.prototype.value = function() {
    return this._wrapped;
  };

  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  if (typeof define === 'function' && define.amd) {
    define('undescore', [], function() {
      return _;
    });
  }






}.call(this));
