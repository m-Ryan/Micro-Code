/**
 * 节流，只拿第一次
 */
const throttle =(function() {
	let timer = 0;

	return function(fn, delay = 1000) {
		
		return function() {
			if(timer) return;
			fn.apply(this, arguments);
			timer = setTimeout(()=>timer = 0, delay);
		}

	}
})()




/**
 * 测试
 */
class Store {

	constructor() {
		this.log = throttle(this.log, 3000);
	}

	log(str) {
		console.log(str)
	}
}


const store = new Store();
store.log('打日志');
store.log('打日志');
store.log('打日志');
store.log('打日志');
store.log('打日志');
