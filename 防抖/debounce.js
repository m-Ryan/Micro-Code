/**
 * 防抖，只拿最后一次
 */
const debounce =(function() {
	let timer = 0;

	return function(fn, delay = 1000) {
		
		return function() {
      const args = arguments;

			if (timer) {
        clearTimeout(timer);
      };

			timer = setTimeout(()=>{
        fn.apply(this, args);
      }, delay);
		}

	}
})()




/**
 * 测试
 */
class Store {

	constructor() {
		this.scroll = debounce(this.scroll, 500);
	}

	scroll(str) {
		console.log(str)
	}
}


const store = new Store();
store.scroll('滚动1');
store.scroll('滚动2');
store.scroll('滚动3');
store.scroll('滚动4');
store.scroll('滚动5');
