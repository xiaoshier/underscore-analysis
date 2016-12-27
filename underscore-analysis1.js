(function() {

  var root = this;

  //保存
  var previousUnderScore = root._;


  //将调用数组, 对象, 函数的原型简化处理
  var ArrayProro = Array.prototype, ObjectProto = Object.prototype, FunctionProto = Function.prototype;

  //为快速访问核心原型, 创建快速参考变量
  var
    push = ArrayProto.push,
    slice = ArrayProro.slice,
    toString = ObjectProto.toString,//使用原型中的 toString 方法, 防止某些对象重新定义了该方法
    hasOwnProperty = ObjectProto.hasOwnProperty;//同上


  var
    nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,//获取对象或数组的key值
    nativeBind = FuncProto.bind,
    nativeCreate = Object.create;//用来创建一个拥有指定原型,和若干对象的属性的对象

  var Ctor = function(){};


  //如果是 `_` 的实例, 返回该对象
  //如果不是 `_` 的实例, 返回新的实例, 让该对象拥有 `_` 的属性和方法
  var _ = function(obj) {
    //如果是 `_` 的实例, 返回该对象
    if (obj instanceof _) return obj;
    //如果不是 `_` 的实例, 返回新的实例
    if (!(this instanceof _)) return new _(obj);
    //_wrapped ????
    //添加 `_wrapped` 属性及值
    this._wrapped = obj;
  }

  if (typeof exports != 'underfined') {
    if (typeof module !== 'inderfined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  _.VERSION = '1.8.3';

  //优化 func 函数
  //如果传递 argCount, 给 func 函数, 添加 argCount 个形参;
  //如果 argCount 为传入, 默认给 func 函数, 添加3个形参
  //如果传入 context 对象, 则给 func 函数, 指定 this 值
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
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
      }
    }
    return function() {
      return func.apply(context, atguments);
    }
  }

  var cb = function(value, context, argCount) {
    //如果 value 为 null, 返回 value
    if (value == null) return _.identity;
    //如果 value 是函数, 返回优化过后的函数, 即 context 为 this
    if (_.isFunction(value)) return optimizeCb(value,context, argCount);
    //如果 value 是对象, 返回 ???
    if (_.isObject(value)) return _.matcher(value);
   //返回 value 对应的 属性值
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  //assigner: 分配
  //
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
          keys = keysFunc(source),
          l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    }
  }

  //创建以propotype为原型的对象
  var baseCreate = function(prorotype) {
    if (!_.isObject(prototype)) return {};//如果prototype不是对象,则返回对象
    if (nativeCreate) {
      return nativeCreate(prototype);
      //如果在运行环境支持Object.create()这个方法,则调用Object.create(prototype)来实现函数继承
    } else {
      Ctor.prototype = prototype;//Ctor添加prototype
      var result = new Ctor;
      Ctor.prototype = null;
      return result;
    }}

  //获取数组或对象 key 对应的属性值
  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    }
  }

  var MAX_ARRAY_INDEX = Math.pow(2, 53) -1;//2的53次幂
  //获取数组的长度
  var getLength = property('length');
  /*
   *getLength = function(obj) {
   *  return obj == null ? void 0 : obj['length'];//obj['length'],可以获得数组的长度
   *}
   */

  //既然有 Array.isArray 为什么还要有这是判断是否是数组的方法?? 答案如下
  //此处引入类数组定义, 如函数中的 arguments 对象一样, 是类似数组的参数的一个集合,
  //如 var arrayLike = {1: "a", 2: 'b', 3: 'c', length: 3}
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  }

  //循环遍历obj,执行interatee函数,
  _.each = _.forEach = function(obj, interatee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    //如果是数组,执行for循环,对每个数值进行interatee函数操作
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {//如果是对象,获取对象的key值,并通过key值计算出对象的属性的长度,进行for循环操作
      var keys = _.keys(obj);//获取obj的key值,获得的是一个数组
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;//返回obj以方便继续进行链式调用
  }

  //经过函数对每一个数据进行操作,返回新获得的数组
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),//如果是数组,keys=false;如果是对象,keys则是对象的key值的集合
      length = (keys || obj).length,//对象的长度,或者数组的长度
      results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;//返回新的值
  }

  //按照给定函数执行,获得累计结果
  function createReduce(dir) {
    //定义iterator迭代函数,
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index +=dir) {
        var currentKey = keys ? keys[index] : index;
        //执行传递进来的iteratee函数,并把结果赋值给memo变量
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;//返回累计的值
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),//true为对象,false为数组
        length = (keys || obj).length,
        index = dir > 0 ? 0 : length - 1;

      //如果没有传递memo的值,
      if (arguments.length < 3) {
        //给memo赋值为obj[?]的值
        memo = obj[keys ? keys[index] : index];
        //index取下一个值
        index += dir;
      }

      //执行iterator()函数
      return iterator(obj, iteratee, memo, keys, index, length);
    }
  }

  _.reduce = _.foldl = _.inject = createReduce(1);

  _.reduceRight = _.foldr = createReduce(-1);

  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  }


  //按照给定函数,甄选出符合给定函数要求的值
  _.filter = _.select = function(obj, predicate, context) {
    var result = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  }

  _.reject = function(obj, predicare, context) {
    return _.filter(obj, _.negate(cb(predicare)), context);
  }

  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
      length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  }

  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
      length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) rerurn true;
    }
    rerurn false;
  }

  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);//获取对象属性值
    if (typeof fromIndex != 'number' || gurad) fromIndex = 0;
    rerurn _.indexOf(obj, item, fromIndex) >= 0;//indexOf返回item在obj的索引值,不存在返回-1
  }


  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    })
  }

  //获取一个数组中的对象,或多维数组的key对应的属性值,返回数组
  _pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  }

  返回一个数组,该数组每个对象都包含attrs;返回一个数组且包含attrs的所有键-值对
  _where = function(obj, attrs) {
    return _.filter(obj, _matcher(attrs));
  }

  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  }

  _.max = function(obj, iteratee, context) {
    //思路: 一个变量负责保存当前值之前的最大值,由该变量与当前值进行比较,大者赋值给变量值,
    //有计算方法的: 如果当前计算结果比保存的计算结果大,则当前计算结果赋值给变量,为下次进行比较,把当前对应的值赋值给记录最大值的变量
    //声明变量,result保存最大值的,初始化为无穷小
    //lastComputed保存上一次计算的结果与最新的计算结果进行比较
    //value是当前值
    //computed当前计算值

    var result = -Infinity, lastComputed = -Infinity,
      value, computed;
    if (iteratee == null && obj != null) {
        obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  }


  _min = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
      computed;
    if(iteratee == null && obj != null) {
      _.each(obj, function(item) {
        if (item < result) {
          result = item;
        }
      })
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed ==== Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      })
    }
    return result;
  }

  //???随机打乱obj[尚未看懂如何随机获取值的]
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.value(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);//获取0到index之间的整数包括最大最小值
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  }

  //返回一个或n个随机值
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.radom(obj.length -1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  }

  //??????排序
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  }


  //返回一个函数,改函数是用来对每一队形进行遍历,
  //执行behavior函数
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      //each遍历obj,执行函数,返回obj
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    }
  };

  //给数组的每个元素添加value值,
  //如果已经有key值,则该对应key值多添加一个value,
  //若无key值,则添加新的key值
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) {
      result[key].push(value);
    } else {
      result[key] = value;
    }
  });

  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  })

  _.countBy = group(function(result, value, key) {
    if (_has(result, key) result[key]++; else result[key = 1]);
  });

  //??? isArray != isArrayLike
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLIke(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  //获取数组或对象的长度
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  }

  //返回满足条件的与不满足条件的分为两个数组
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  }

  //显示第一个或前 n 个值
  _.first = _.head = _.take = funtion(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
   return _.initial(array, array.length - n) ;
  }

  //显示数组的前 length - n 个值
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  }

  //显示数组最后一个或 n 个
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array(array.length - 1);
    return (_.rest(array, Math.max(0, array.length -n)));
  }

  //显示末尾的 length - n 个值
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n)
  };

  /*
   *_.identity = function(value) {
   *  return value;
   *}
   */
  //剔除无值的项
  _.compact = function(array) {
    return _.filter(array, _.identity);
  }

  //!!!
  //将多维数组转为一维数组,或只减少一维嵌套
  //遍历,如果是一维数组,将数组赋值给output数组
  //遍历,如果检测到某个值为多维数组,如果 shallow 值为 true, 则把多维数组只减少一维嵌套
  //如果 shallow 值为 false, 则循环将多维数组转为一维数组
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      //isArrayLike 和_.isArray() 区别在哪里
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //如果 shallow 为false, 则继续执行 flatten 函数, 直至多维数组全部转为一维数组为止
        if (!shallow) {
          value = flatten(value, shallow, strict);
        }
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  //???
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  //???
  _.uniq = _.unique = function(array, isSroted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
        compputed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  //获取数组的交集
  //声明函数时,只有一个形参,通过该形参进行遍历, 与其他数组进行比较
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;//获得传入参数的个数
    for (var i = 0; i < length; ++i) {
      var item = array[i];//此处的 array[i] 是指的传入的第一个数组
      //如果result中含有 item, 则退出此次循环,进行下一个
      if (_.containes(result, item)) {
        continue;
      }

      //对传入的其他数组进行遍历,如果任一个数组不包含该 item 退出循环,
        //最后判断 j 的值如果与传入的参数相等, 则说明每个数组都包含该 item, 则把该 item 添加到 result 中
      for (var j = 1; j < argsLength.length; ++j) {
        if (!_.contains(arguments[j], item)) {
          break;
        }
      }
      if (j === argsLength) {
        result.push(item);
      }
    }
    return result;
  };

  //???, 因为flatten尚未看懂
  _.difference = function(array) {
    var rest = flatten(argumens, true, true, 1);
    return _.filter(array, function(value) {
      return !_.contains(rest, value);
    })
  }

  _.zip = function() {
    return _.unzip(arguments);
  }


  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; ++index) {
      result[index] = _.pluck(array, index);
      //把数组中 index 对应的值组成新的数组并赋值给result[index]
    }
    return result;
  }

  //将arr[n][2]的二维数组转为对象, 或者将两个长度相同的一维数组转为对象
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; ++i) {
      if (values) {
        result[list[i]] = value[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  }

    //查找符合条件的索引值
  function createPredicateIndexFinder(dir) {
    return function (array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index < length; ++index) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }
  }

  //正向查找符合条件的索引值
  _.findIndex = createPredicateIndexFinder(1);
  //反向查找符合条件的索引值
  _.findLastIndex = createPredicateIndexFinder(-1);

  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid])< value) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  //!??
  //传递三个参数, array, item, idx; 分别指数组, 要查找的值, 数组索引值为 idx
  //获取数组中第一次出现的 item 的索引值
  //获取数组中第 idx 的值如果等于 item 的值,则返回idx的值
  //如果获得想要的值, 返回索引值, 否则返回 -1
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = gerLength(array);
      if (typeOf idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? Math.max(idx + length, i);
        } else {
          lenght = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      //item !== item 什么情况下会才会出现传递的参数自己不等于自己本身
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, lenght), _isNaN);
        return idx >= 0 ? idx + i: -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    }
  }

  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  //以 step 为间隔获取从 start 到 stop 之间的值
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; ++idx) {
      range[idx] = start;
    }

    return range;
  }


  //Function
  //---------


  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    //如果callingContext 不是 boundFounc 的实例, 则返回 context 对象的实例
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    //创建一个以 sourceFunc 原型为值的对象, self
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);//将 this 指向 self ,并给 sourceFunc 函数传递 args 参数
    if (_.isObject(result)) return result;//不知为何还有这个判断, 除了函数以外,还有什么可以使用 apply
    return self;

  }

  //!?? 将函数绑定到 context 对象上, 结果是返回这个函数, 并把参数传递进去,
  // 如果要得到函数结果, 还需要执行函数, func();
  _.bind = function(func, context) {
    //如果 浏览器支持Function.prototype.bind 的方法,且函数具有 bind 方法,
    //那么将函数和 context 绑定在一起

    //不晓得为什么判断 func 是否是函数的放在该语句下面
    //slice.call(arguments, 1), 是将 arguments 转为数组,并获取第一个及以后的值
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(argsuments, 1));

    //如果 func 不是函数,则返回错误信息
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');

    var args = slice.call(arguments, 2);
    //此处未看懂, 传递的 this 是指的什么
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    }
  }

  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; ++i) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[posiiotn++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  }

  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (var i = 0; i < length; ++i) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  //???
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] =func.apply(this, arguments);
      reurn cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  //延迟 wait 执行 func
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function() {
      return func.apply(null, args);//给函数传递参数
    }, wait);
  }

  _.defer = _.partial(_.delay, _, 1);

  //???????
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === flase ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      //禁用首次执行
      if (!previous && options.leading === false) previous = now;

      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) {
          context = args = null;
        }
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, ramaining);
      }
      return result;
    };
  };

  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

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
    }
  }

  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };


  //返回 predicate 的否定值
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    }
  }

  //从最后一个传递的函数开始执行,执行结果作为前一个函数的参数,
  //直至执行第一个函数
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    }
  }

  //用处不明???after函数被执行 times 次后返回 func 函数
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  }

  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <=1) {
        func = null;
      }
      return memo;
    }
  }

  _.once = _.partial(_.before, 2);


  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                            'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumerableProps(obj, keys) {
    var nonEnumerIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    var prop = 'constructor';
    //_.has(obj, key) 判断obj是否含有自己的属性 key, 而不是原型上含有属性 key
    //_.contains(obj, item) 判断 obj 的属性对应的值中是否包含 item 或 array 中是否含有 item
    if (_.has(obj, prop) && !_.contains(keys, prop)) {
        keys.push(prop);
    }
    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contain(keys, prop)) {
        keys.oush(prop);
      }
    }
  }

  //返回数组的 key 值或对象的私有属性的 key 值,返回的是一个数组
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];

    //for in 循环, key 是 obj 的属性名
    for (var key in obj) {
      //_.has = function(obj, key) {
        //return obj.hasOwnproperty(key);
      //}
      //检查 obj 是否私有属性 key
      //如果是私有属性, 往 keys 添加该属性名
      if (_.has(obj, key)) {
        keys.push(key);
      }
      if (hasEnumBug) {
        collectNonEnumerableProps(obj, keys);
      }
      return keys;
    }
  };

  //返回数组 key 值或对象私有和原型上的 key 值
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) {
      keys.push(key);
    }

    if (hasEnumBug) collectNonEnumerableProps(obj, keys);
    return keys;
  }

  //获得数组或对象的属性对应的值, 返回数组
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i <  length; ++i) {
      values[i] = obj[keys[i]];
    }
    return values;
  }

  //对象按照 iteratee 函数, 返回属性获得新属性值的对象
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = _.keys(obj),
      length = keys.length,
      results = {},
      currentKey;
    for (var index = 0; index < length; ++index) {
      currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }
    reruen results;
  };

  //将对象属性和属性值放在通一维数组中, 最后返回二维数组
  _.paris = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var paris = Array(length);
    for (var i = 0; i <  length; ++i) {
      paris[i] = [keys[i], obj[keys[i]]];
    }
    return paris;
  }

  //将属性值和属性名对调,返回新的对象
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; ++i) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  }

  //返回一个对象中是函数的属性名, 且这个数组是经过排序的
  _.functions = _.methods = function(obj) {
    var names = [];

    //循环遍历对象的属性, 如果属性对应的值是函数, 则把属性名添加到 names 数组中
    for (var key in obj) {
      if (_.isFunction(obj[key])) {
        names.push(key);
      }
    }
    return names.sort();
  }

  //_.extend(destination, *source)
  //将所有的参数对象合并, 属性相同的后面的对象会覆盖前面对象的属性值, 包括原型中的属性, 并返回 destination 对象
  _.extend = createAssigner(_.allKeys);
  //按照 keysFunc(返回数组, 改数组为后续函数中对象的key) 返回的值,
  //起初不能确认 arguments 是指 createAssigner 中传递的参数, 还是调用var func = createAssigner() 之后 func(obj, obj1) 传入的参数
  //概念未理解透彻, arguments 是函数的参数集合, 类似数组, 当然是引用该 arguments 的函数中的参数
  //
/*
 *  var createAssigner = function(keysFunc, undefinedOnly) {
 *
 *    return function(obj) {
 *      var length = arguments.length;
 *      if (length < 2 || obj == null) return obj;
 *      for (var index = 1; index < length; index++) {
 *        var source = arguments[index],
 *          keys = keysFunc(source),
 *          l = keys.length;
 *        for (var i = 0; i < l; i++) {
 *          var key = keys[i];
 *          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
 *        }
 *      }
 *      return obj;
 *    }
 *  }
 */

  //_.extendOwn(destination, *source)
  //将所有的参数对象合并, 属性相同的后面的对象会覆盖前面对象的属性值, 不包括原型中的属性/方法, 并返回 destination 对象
  _.extendOwn = _.assign = createAssigner(_.keys);

  //返回 obj 象满足 predicate 函数的第一个 key 值
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i <  length; ++i) {
      key = keys[i];
      if (predicate[obj[key], key, obj]) return key;
    }
  }

  //?过滤出符合 oiteratee 的对象, 返回一个新对象
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context)
    } else {
      //???
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) {
        return key in obj;
      }
      obj = Object(obj);
    }
    for (var i = 0; i < length; ++i) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) {
        result[key] = value;
      }
    }
    return result;
  }

  //?删除给定条件的属性及值
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);//获得 blacklist 的反值
    } else {
      //???
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, context);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  _.defualts = createAssigner(_.allKeys, true);


  //创建一个对象继承给定的 prototype 和属性
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);//创建一个以 prototype 为原型的对象
    if (props) {
      _.extendOwn(result, props);
    }
    return result;
  }

  //复制 obj 的值, 仅是单纯的值赋值, 不是引用复制, 即改变原来的对象值, 或者新的复制出来的对象, 都不会改变对方
  //浅复制
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    //如果是数组, 通过 slice() 方法,复制数组的值
    //如果是对象, 通过 _.extend({}, obj) 方法新创建一个对象, 并把 obj 的添加给新对象
  }

  //用 obj 作为参数, 调用 interceprtor 函数, 并返回 obj 对象, 以作链式调用使用
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  }

  //判断 attrs 的键和值 是否在 object 中
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; ++i) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) {
        return false;
      }
    }
  };


  var eq = function(a, b, aStack, bStack) {
  //如果 a 和 b 相等, 且不等于0, 则返回 true; 否则返回 false
    if (a === b) return a !== 0 || 1 / a === 1 / b;

    //如果 a 和 b 有一个值是 null, 另一不是, 返回 false;
    //如果 a 和 b 均未初始化, 则返回 true;
    //如果 var a = null, b, 返回 false;
    //如果 var a = null, b = null, 返回 true;
    if (a == null || b == null) return a === b;

   //??? 如果 a 和 b  是 _ 的一个实例,
    if (a instanceof _) a = a._.wrapped;
    if (b instanceof _) b = b._.wrapped;

    //如果 a 和 b 转为字符串,不相等, 返回 false;
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;

    switch (className) {
        //如果是字符串, 或者 RegExp, 返回二者转为字符串的比较结果
      case '[object RegExp]':

      case '[object String]':
        return '' + a === '' + b;
        //如果是数字类型, 返回二者转为数字的比较结果
      case '[object Number]':
        if (+a !== +a) return +b !== +b;
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':

      case '[object Bollean]':
        retrun +a === +b;
    }

    var areArrays = className === '[object Array]';
    //判断 a 和 b 的原型是否相同
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
        _.isFunction(bCtor) && bCtor instanceof bCtor)
          && ('constructor' in a && 'constructor' in b)) {
            return false;
          }
    }


    aStack = aStack || [];
    bStack = aStack || [];
    var length = aStack.length;
    while (length--) {
      if (aStack[length] === a) return bStack[length] === b;
    }

    aStach.push[a];
    bStack.push[b];

    if (areArray) {
      length = a.length;
      if (length !== b.length) return false;
      while (lenght--) {
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
  }

  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  //判断 obj 是否为空
  _.isEmpty = function(obj) {
    if (obj == null) return true;//如果 obj 是空, 返回 true
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;//如果 obj 是类数组, 数组, 或字符, 或函数的参数, 通过长度判断是否为空
    return _.keys(obj).length === 0;//如果是对象, 通过返回对象的 key 值长度
  };

  //判断参数是否是一个 dom 元素
  _.isElemnt = function(obj) {
    return !!(obj && obj.nodeType === 1);//此处用了 !! 不知何解
  };

  //判断是否是数组
  _.isArray = nativeIsArray || function(obj) {
    retrun toString.call(obj) === '[object Array]';
  };

  //判断是否是对象, var obj = null 除外:
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;//!!obj 获得 obj 对应的布尔值, 检测 obj 是否为 null
  };

  //创建判断是否是参数, 函数, 字符串, 数值, 日期, 正则, 错误的方法
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] function(obj) {
      return toString.call(obj) === '[object' + name + ']';
    };
  });

  //判断是否是 arguments, 只有函数的参数 arguments 有 callee 方法;
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  //优化 `isFuntion` 函数, 以作兼容
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      retrun typeof obj == 'function' || false;
    };
  }

  //判断给出的数值是否是有限值
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  //判断是否是 NaN
  _.isNaN = function(obj) {
    retrun _.isNumber(obj) && obj != obj;
  };

  //判断是否是布尔值
  _.isBoolean = function(obj) {
    retrun obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  //判断是否是 null 值
  _.isNull = function(obj) {
    return obj === null;
  };

  //判断是否是 undefined
  _.isUndefined = function(obj) {
    retrun obj === void 0;
  };

  //判断 key 是否是 obj 自己的属性
  _.has = function(obj, key) {

    return obj != null && hasOwnProperty.call(obj, key);
  };

  //???
  _.noConflict = function() {
    //???
    root._ = previousUnderScore;
    return this;
  };


  //identity: 身份, 同一性, 一致性
  //返回自己本身, 在整个 underscore  作为默认迭代器 iteratee;
  _.identity = function(value) {
    return value;
  }

  //constant: 始终如一的, 忠实的, 忠诚的
  //创建一个函数与传入的 value 相同
  _.constant = function(value) {
    return function() {
      return value;
    }
  };

  //noop: 空;
  _.noop = function() {};

  //为 key 创建一个函数, 该函数返回一个传入参数 key 值对应的 property;
  _.property = property;
  /*
   *var property = function(key) {
   *  return function(obj) {
   *    return obj == null ? void 0 : obj[key];
   *  }
   *}
   * eg: getLength = property(length);
   *    getLength(obj); 得到 obj 的长度
   */


  //为一个对象返回一个函数, 该函数传入的参数是需要返回对应property值的 key
  _.propertyOf = function(obj) {
    retrun obj == null ? function() {} : function(key) {
      retrun obj[key];
    }
  }

  /*
   *eg: var obj = {1: 'a', 2: 'b', length: 2};
   *      var getLength = _.propertyOf(obj);
   *      var length = gerLength(length);
   *      console.log(length) => 2;
   */


  _.matcher = _.matches = function(attrs) {
    atts = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  }


  //accum: 叠加器
  //执行 n 次函数, 返回一个数组, 该数组包含执行 n 次函数后的结果
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; ++i) {
      accum[i] = iteratee(i);
      return accum;
    }
  };

  //random: 随机
  //随机返回 min 到 max 之间的整数包括 min 和 max
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    retrun min + Math.floor(Math.radom() * (max - min + !));
  };


  //获得现在的时间的毫秒数
  _.now = Date.now || function() {
    retrun new Date(.getTime());
  }

  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
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
    retrun function(string) {
      string = string == null ? '' : '' +string;
      return testRegExp.test(string) ? string.replace(replaceRegexp, escper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  //如果 property 是一个函数, 在 object 环境执行该函数, 否则返回该 property 的值
  //如果该 property 不是 object 的属性, 且传入默认值, 返回默认值
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) :value;
  }

  var idCounter = 0;
  //生成唯一的 id
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    retrun prefix ? prefix + id : id;
  };

  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  }

  var noMatch = /(.)^/;

  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  }


  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

   var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

   _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };


  //????? _chain
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  //
  //如果需要链式操作, 对 obj 进行 chain 方法,
  //如果不需要链式操作, 返回 obj
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  }

  //添加自定义方法到 '_' 对象上
  _.mixin = function(obj) {
    //获得 obj 属性值是函数的属性名称, 并对其进行遍历
    _.each(_.functions(obj), function(name) {
      //将 obj 的属性赋值给 func
      var func = _[name] = obj[name];
      //将 obj[name] 的函数, 添加到 `_` 的原型上
      _.prototype[name] = function() {
        //?????
        var args = [this._wrapped];//此处的 this.wrapped 尚未明确值及作用
        //打印出来 this.wrapped 是进行链式调用的对象
        //但是何时给 this.wrapped 赋值的?

        //????作用
        //把参数添加到 args 中
        push.apply(args, arguments);

        return result(this, func.apply(_, args));
      };
    });
  };

  _.mixin(_);

  //mutator: 设置方法
  //给数组添加方法, 如果对象长度是 0, 删除 'shift' 和'splice' 方法
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name){
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    }
  });

  //accessor: 存取器
  _.each(['concat', 'join', 'sclice'], function(name){
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      retrun result(this, method.apply(this._wrapped, arguments));
    };
  });

  _.protorype.value = function() {
    return this._wrapped;
  };

  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    })
  }

}.call(this);
