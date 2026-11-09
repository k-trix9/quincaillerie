import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import { createSale, fetchProducts } from "../services/db";

const CATEGORY_ICON = {
    Cement: "🧱",
    Steel: "🔩",
    "Blocks & Bricks": "🧱",
    Tools: "🔧",
    Equipment: "🏗️",
    Electrical: "💡",
    Plumbing: "🚿"
};

const PAY_METHODS = ["Cash", "MoMo", "Card"];
const VAT_RATE = 0.18;

const formatMoney = (amount) =>
    new Intl.NumberFormat("en-RW").format(amount) + " RWF";

function CashRegister() {

    const [allProducts, setAllProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [cart, setCart] = useState([]);
    const [method, setMethod] = useState("Cash");
    const [lastSale, setLastSale] = useState(null);

    useEffect(() => {
        let active = true;

        fetchProducts().then((list) => {
            if (active) {
                setAllProducts(list);
            }
        });

        return () => {
            active = false;
        };
    }, []);

    const products = useMemo(
        () => allProducts.filter((p) => p.type !== "rental"),
        [allProducts]
    );

    const categories = useMemo(
        () => ["All", ...new Set(products.map((p) => p.category))],
        [products]
    );

    const filtered = products.filter((p) => {
        const matchesSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
            category === "All" || p.category === category;

        return matchesSearch && matchesCategory;
    });

    const addToCart = (product) => {

        setLastSale(null);

        setCart((current) => {

            const existing = current.find(
                (item) => item.id === product.id
            );

            if (existing) {
                return current.map((item) =>
                    item.id === product.id
                        ? { ...item, qty: item.qty + 1 }
                        : item
                );
            }

            return [
                ...current,
                {
                    id: product.id,
                    name: product.name,
                    price: product.sellingPrice,
                    unit: product.unit,
                    qty: 1
                }
            ];
        });
    };

    const changeQty = (id, delta) => {
        setCart((current) =>
            current
                .map((item) =>
                    item.id === id
                        ? { ...item, qty: item.qty + delta }
                        : item
                )
                .filter((item) => item.qty > 0)
        );
    };

    const removeItem = (id) => {
        setCart((current) =>
            current.filter((item) => item.id !== id)
        );
    };

    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );

    const vat = Math.round(subtotal * VAT_RATE);
    const total = subtotal + vat;

    const checkout = () => {

        if (cart.length === 0) {
            return;
        }

        const receipt = {
            items: cart.reduce(
                (sum, item) => sum + item.qty,
                0
            ),
            lines: cart,
            subtotal,
            vat,
            total,
            method
        };

        setLastSale(receipt);

        createSale(receipt);

        setCart([]);
    };

    return (

        <div className="dashboard-layout">

            <Sidebar />

            <main className="dashboard-content">

                <header className="dashboard-header">

                    <div>
                        <p>POINT OF SALE</p>
                        <h1>Cash Register</h1>
                    </div>

                    <div className="date-pill">
                        🧾 New sale
                    </div>

                </header>

                <div className="pos-layout">

                    <section>

                        <div className="pos-toolbar">

                            <input
                                type="text"
                                placeholder="Scan or search products..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                            <select
                                value={category}
                                onChange={(e) =>
                                    setCategory(e.target.value)
                                }
                            >
                                {categories.map((cat) => (
                                    <option key={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>

                        </div>

                        <div className="pos-grid">

                            {filtered.map((product) => (

                                <button
                                    key={product.id}
                                    className="pos-item"
                                    onClick={() =>
                                        addToCart(product)
                                    }
                                >

                                    <div className="pos-emoji">
                                        {CATEGORY_ICON[
                                            product.category
                                        ] || "📦"}
                                    </div>

                                    <h4>{product.name}</h4>

                                    <small>
                                        {product.category}
                                    </small>

                                    <strong>
                                        {formatMoney(
                                            product.sellingPrice
                                        )}
                                    </strong>

                                </button>

                            ))}

                        </div>

                    </section>

                    <aside className="pos-cart">

                        <h2>Current Sale</h2>
                        <p>
                            {cart.length} item
                            {cart.length === 1 ? "" : "s"} in cart
                        </p>

                        {lastSale && (
                            <div className="auth-success">
                                ✅ Sale of {lastSale.items} item
                                {lastSale.items === 1 ? "" : "s"} (
                                {formatMoney(lastSale.total)} via{" "}
                                {lastSale.method}) completed.
                            </div>
                        )}

                        {cart.length === 0 ? (

                            <div className="cart-empty">
                                Cart is empty. Select products to
                                start a sale.
                            </div>

                        ) : (

                            <ul className="cart-items">

                                {cart.map((item) => (

                                    <li
                                        className="cart-row"
                                        key={item.id}
                                    >

                                        <div className="cart-row-info">
                                            <h4>{item.name}</h4>
                                            <small>
                                                {formatMoney(
                                                    item.price
                                                )}{" "}
                                                / {item.unit}
                                            </small>
                                        </div>

                                        <div className="qty-control">

                                            <button
                                                onClick={() =>
                                                    changeQty(
                                                        item.id,
                                                        -1
                                                    )
                                                }
                                                aria-label="Decrease"
                                            >
                                                −
                                            </button>

                                            <span>{item.qty}</span>

                                            <button
                                                onClick={() =>
                                                    changeQty(
                                                        item.id,
                                                        1
                                                    )
                                                }
                                                aria-label="Increase"
                                            >
                                                +
                                            </button>

                                        </div>

                                        <button
                                            className="cart-remove"
                                            onClick={() =>
                                                removeItem(item.id)
                                            }
                                            aria-label="Remove"
                                        >
                                            ✕
                                        </button>

                                    </li>

                                ))}

                            </ul>

                        )}

                        <div className="cart-summary">

                            <div className="row">
                                <span>Subtotal</span>
                                <span>{formatMoney(subtotal)}</span>
                            </div>

                            <div className="row">
                                <span>VAT (18%)</span>
                                <span>{formatMoney(vat)}</span>
                            </div>

                            <div className="row total">
                                <span>Total</span>
                                <span>{formatMoney(total)}</span>
                            </div>

                        </div>

                        <div className="pay-methods">

                            {PAY_METHODS.map((option) => (

                                <button
                                    key={option}
                                    className={
                                        method === option
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() => setMethod(option)}
                                >
                                    {option}
                                </button>

                            ))}

                        </div>

                        <button
                            className="btn btn-success btn-block"
                            onClick={checkout}
                            disabled={cart.length === 0}
                            style={{
                                opacity: cart.length === 0 ? 0.5 : 1,
                                cursor:
                                    cart.length === 0
                                        ? "not-allowed"
                                        : "pointer"
                            }}
                        >
                            💳 Charge {formatMoney(total)}
                        </button>

                    </aside>

                </div>

            </main>

        </div>
    );
}

export default CashRegister;
