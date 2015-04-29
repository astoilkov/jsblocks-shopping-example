(function () {
	var App = blocks.Application({
		history: 'pushState'
	});

	var Sidebar = {
		from: blocks.observable(10),
		to: blocks.observable(400),

		category: blocks.observable('All'),

		categories: ['All', 'Boys', 'Girls', 'Babies', 'Underwear'],

		selectCategory: function (e, category) {
			Sidebar.category(category);
			e.preventDefault();
		},

		brand: blocks.observable('All'),
		brands: ['All', 'Lima', 'Rach'],
		selectBrand: function (e, brand) {
			Sidebar.brand(brand);
		}
	};

	var Product = App.Model({
		price: App.Property(),

		title: App.Property(),

		brand: App.Property(),

		image: App.Property(),

		quantity: App.Property({
			value: 1,
			change: function () {
				if (this.collection()) {
					this.collection().quantityChange();
				}
			}
		}),

		quantityPlus: function () {
			this.quantity(parseFloat(this.quantity()) + 1);
		},

		quantityMinus: function () {
			if (this.quantity() > 1) {
				this.quantity(this.quantity() - 1);
			}
		}
	});

	var Products = App.Collection(Product, {
		options: {
			read: {
				url: '/products.json'
			}
		},

		quantityChange: blocks.noop
	});

	App.View('Home', {
		options: {
			route: blocks.route('/{{type}}/{{value}}').optional('type').optional('value'),
			url: '/views/home.html'
		},

		Sidebar: Sidebar,

		products: Products().extend('filter', function (product) {
			var include = true;
			var category = this.Sidebar.category().toLowerCase();
			var brand = this.Sidebar.brand().toLowerCase();

			if (category && category != 'all') {
				include = product.type().toLowerCase() == category;
			}
			if (include && brand && brand != 'all') {
				include = product.brand().toLowerCase() == brand;
			}
			return include;
		}).extend('step', function () {
			var pages = blocks.range(1, this.products.view().length / this.take());
			this.pages(pages.length ? pages : [1]);
		}).extend('skip', function () {
			return (this.page() - 1) * this.take();
		}).extend('take', function () {
			return this.take();
		}).read(function () {
			// TODO: this is incorrect here
		}),

		pages: blocks.observable([]),

		page: blocks.observable(1),

		take: blocks.observable(9),

		init: function () {
			var page = this.page;
			Sidebar.category.on('change', this.resetPage);
			Sidebar.brand.on('change', this.resetPage);

			//this.products.view();
		},

		resetPage: function () {
			this.page(1);
		},

		pagePlus: function () {
			if (this.page() < this.pages().length) {
				this.page(this.page() + 1);
			}
		},

		pageMinus: function () {
			if (this.page() > 1) {
				this.page(this.page() - 1);
			}
		},

		setPage: function(e, page) {
			this.page(page);
		}
	});

	App.View('Product', {
		options: {
			route: 'product/{{image}}',
			url: '/views/product.html'
		},

		Sidebar: Sidebar,

		product: Product(),

		products: Products().read(),

		routed: function (params) {
			this.image = params.image;
			if (this.products.length == 0) {
				this.products.on('add', this.populate);
			} else {
				this.populate();
			}
		},

		populate: function () {
			var image = this.image;

			this.product.reset(this.products.first(function (value) {
				return value.image() == image;
			}));
		}
	});

	App.View('Cart', {
		options: {
			route: 'cart',
			url: '/views/cart.html'
		},

		products: Products(),

		empty: blocks.observable(function () {
			return this.products().length == 0;
		}),

		subTotal: blocks.observable(function () {
			return this.products.reduce(function (memo, value) {
				return memo + (value.quantity() * value.price());
			}, 0);
		}),

		checkOut: function () {
			this.products.removeAll();
		}
	});

	var Article = App.Model({
		visible: blocks.observable(),

		init: function () {
			this.createDate = new Date(this.create());
			this.date = this.createDate.toDateString().substring(4);
			this.time = this.createDate.toTimeString().substring(0, 5) + ' am';
		},

		toggle: function (e) {
			this.visible(!this.visible());
		}
	});

	var Articles = App.Collection(Article, {
		options: {
			read: {
				url: '/articles.json'
			}
		}
	});

	App.View('News', {
		options: {
			route: blocks.route('news/{{page}}').optional('page', 1),
			url: '/views/news.html'
		},

		news: Articles().extend('sort', function (valueA, valueB) {
			return valueB.createDate - valueA.createDate;
		}).extend('skip', function () {
			return (this.page() - 1) * this.pageSize;
		}).extend('take', function () {
			return this.pageSize;
		}),

		pageSize: 3,

		page: blocks.observable(1),

		pages: blocks.observable([]),

		init: function () {
			this.news.read(function () {
				this.pages(blocks.range(1, this.news.size() / this.pageSize + 1));
			});
		},

		routed: function (params) {
			this.page(parseInt(params.page, 10) || 1);
		}
	});

	var Message = App.Model({
		name: App.Property({
			required: 'Please enter your name',
			maxlength: {
				value: 20,
				message: 'Name too long. Make it shorter'
			}
		}),

		email: App.Property({
			required: 'Please enter your email',
			email: 'Please enter a valid email',
			maxlength: {
				value: 30,
				message: 'Email too long. Make it shorter'
			}
		}),

		subject: App.Property({
			required: 'Please enter a subject'
		}),

		content: App.Property({
			required: 'Please enter a content',
			minlength: {
				value: 20,
				message: 'Message too short. Make it longer'
			}
		})
	});

	App.View('Contact', {
		options: {
			route: 'contact',
			url: '/views/contact.html'
		},

		message: Message(),

		send: function (e) {
			if (this.message.validate()) {
				debugger;
				this.message.reset();
				alert("Message sent successfully. Congratulations!")
			}
			e.preventDefault();
		}
	});

	App.extend({
		addToCart: function (e, product) {
			var cartProducts = App.Cart.products;

			if (!cartProducts.some(function (value) {
					if (value.image() == product.image()) {
						value.quantityPlus();
						return true;
					}
				})) {
				cartProducts.add(product);
			}
		},

		searchItems: Products().extend('filter', function (value) {
			return !!(this.search() && value.title().toLowerCase().indexOf(this.search()) != -1);
		}).read(),

		search: blocks.observable(),

		clearSearch: function () {
			this.search('');
		}
	});
})();