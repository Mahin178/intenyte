(function () {
    'use strict';

    const STORAGE_KEY = 'intenyte_cart';

    const PRODUCT = {
        id: 'nt-01',
        name: 'INTENYTE NT-01',
        description: 'Premium Dual Display Smart Home Dashboard',
        price: 24999,
        image: 'img/Hero_image.png'
    };

    let instance = null;

    class Cart {
        constructor() {
            if (instance) return instance;
            this._items = [];
            this.load();
            instance = this;
        }

        addItem(variant) {
            const existing = this._items.find(
                (item) => item.id === PRODUCT.id && item.variant === variant
            );
            if (existing) {
                existing.quantity++;
            } else {
                this._items.push({
                    id: PRODUCT.id,
                    name: PRODUCT.name,
                    price: PRODUCT.price,
                    quantity: 1,
                    variant: variant || 'Default'
                });
            }
            this._save();
        }

        removeItem(id) {
            this._items = this._items.filter((item) => item.id !== id);
            this._save();
        }

        updateQuantity(id, qty) {
            const item = this._items.find((item) => item.id === id);
            if (!item) return;
            if (qty <= 0) {
                this.removeItem(id);
                return;
            }
            item.quantity = qty;
            this._save();
        }

        getItems() {
            return this._items;
        }

        getTotal() {
            return this._items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
        }

        getCount() {
            return this._items.reduce((sum, item) => sum + item.quantity, 0);
        }

        clear() {
            this._items = [];
            this._save();
        }

        save() {
            this._save();
        }

        load() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                this._items = data ? JSON.parse(data) : [];
            } catch (e) {
                this._items = [];
            }
            this._updateDOM();
        }

        formatPrice(amount) {
            return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        _save() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this._items));
            } catch (e) {
                // silent fail
            }
            this._updateDOM();
            this._dispatchEvent();
        }

        _updateDOM() {
            const count = this.getCount();
            const badges = document.querySelectorAll('.cart-count');
            badges.forEach((el) => {
                el.textContent = count;
                if (count > 0) {
                    el.classList.add('visible');
                } else {
                    el.classList.remove('visible');
                }
            });
        }

        _dispatchEvent() {
            const event = new CustomEvent('cartUpdate', {
                detail: {
                    items: this.getItems(),
                    count: this.getCount(),
                    total: this.getTotal()
                }
            });
            document.dispatchEvent(event);
        }
    }

    window.Cart = new Cart();
})();
