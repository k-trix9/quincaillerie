import { useEffect, useState } from "react";

import { fetchProducts, saveProduct } from "../services/db";
import { useAuth } from "../context/AuthContext";
import { ADMIN } from "../constants/roles";

function Products() {
    const { user } = useAuth();

    const isAdmin = user?.role === ADMIN;

    const [products, setProducts] = useState([]);

    const [search, setSearch] = useState("");

    const [category, setCategory] = useState("All");

    const [showAdmin, setShowAdmin] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [quantity, setQuantity] = useState(1);

    const [movementType, setMovementType] = useState("");

    const [editProduct, setEditProduct] = useState(null);

    useEffect(() => {
        let active = true;

        fetchProducts().then((list) => {
            if (active) {
                setProducts(list);
            }
        });

        return () => {
            active = false;
        };
    }, []);

    const categories = [
        "All",
        ...new Set(products.map((product) => product.category))
    ];

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.name
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            product.sku
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesCategory =
            category === "All" ||
            product.category === category;

        return matchesSearch && matchesCategory;
    });

    const formatMoney = (amount) => {
        return new Intl.NumberFormat("en-RW").format(amount) + " RWF";
    };

    const availableStock = (product) => {
        return product.stock - (product.rented || 0);
    };

    const openMovement = (product, type) => {
        setSelectedProduct(product);
        setMovementType(type);
        setQuantity(1);
    };

    const processStockMovement = () => {
        if (!selectedProduct) return;

        const qty = Number(quantity);

        if (!qty || qty <= 0) {
            alert("Enter a valid quantity.");
            return;
        }

        const current = products.find(
            (product) => product.id === selectedProduct.id
        );

        if (!current) return;

        let updated = current;

        if (movementType === "in") {

            updated = {
                ...current,
                stock: current.stock + qty
            };

        } else if (movementType === "out") {

            if (qty > availableStock(current)) {
                alert("Not enough available stock.");
                return;
            }

            updated = {
                ...current,
                stock: current.stock - qty
            };

        } else if (movementType === "rent") {

            if (qty > availableStock(current)) {
                alert("Not enough available stock.");
                return;
            }

            updated = {
                ...current,
                rented: (current.rented || 0) + qty
            };

        } else if (movementType === "return") {

            if (qty > (current.rented || 0)) {
                alert("Return quantity is greater than rented quantity.");
                return;
            }

            updated = {
                ...current,
                rented: (current.rented || 0) - qty
            };
        }

        setProducts((currentProducts) =>
            currentProducts.map((product) =>
                product.id === updated.id ? updated : product
            )
        );

        saveProduct(updated);

        setSelectedProduct(null);
    };

    const updatePrice = () => {

        if (!editProduct) return;

        setProducts((currentProducts) =>
            currentProducts.map((product) =>
                product.id === editProduct.id
                    ? editProduct
                    : product
            )
        );

        saveProduct(editProduct);

        setEditProduct(null);
    };

    return (
        <div className="page">

            {/* HEADER */}

            <div className="products-header">

                <div>
                    <p className="eyebrow">
                        INVENTORY MANAGEMENT
                    </p>

                    <h1>Products</h1>

                    <p>
                        Manage construction materials, equipment,
                        prices and inventory.
                    </p>
                </div>

                {isAdmin && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowAdmin(!showAdmin)}
                    >
                        ⚙️ Admin Pricing
                    </button>
                )}

            </div>


            {/* SEARCH */}

            <div className="product-toolbar">

                <input
                    type="text"
                    placeholder="Search products or SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >

                    {categories.map((cat) => (
                        <option key={cat}>
                            {cat}
                        </option>
                    ))}

                </select>

            </div>


            {/* PRODUCTS */}

            <div className="product-grid">

                {filteredProducts.map((product) => {

                    const available =
                        availableStock(product);

                    const lowStock =
                        available <= product.minStock;

                    return (

                        <div
                            className="product-card"
                            key={product.id}
                        >

                            <div className="product-image">

                                <img
                                    src={product.image}
                                    alt={product.name}
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            "https://images.squarespace-cdn.com/content/v1/5c4f26abe74940c50fddd118/5fa9093c-1e54-4af0-9dbf-1566fd43c205/ChatGPT%2BImage%2B28.%2Bdets%2B2025%2C%2B14_31_54.png?format=2500w";
                                    }}
                                />

                                <span className="product-type">
                                    {product.type === "rental"
                                        ? "RENTAL"
                                        : product.type === "both"
                                        ? "SALE + RENT"
                                        : "SALE"}
                                </span>

                            </div>


                            <div className="product-body">

                                <div className="product-category">
                                    {product.category}
                                </div>

                                <h3>
                                    {product.name}
                                </h3>

                                <small>
                                    SKU: {product.sku}
                                </small>


                                <div className="price-section">

                                    <div>
                                        <span>
                                            Selling price
                                        </span>

                                        <strong>
                                            {formatMoney(
                                                product.sellingPrice
                                            )}
                                        </strong>
                                    </div>

                                    {product.rentalPrice > 0 && (

                                        <div>
                                            <span>
                                                Rental / day
                                            </span>

                                            <strong>
                                                {formatMoney(
                                                    product.rentalPrice
                                                )}
                                            </strong>
                                        </div>

                                    )}

                                </div>


                                <div
                                    className={
                                        lowStock
                                            ? "stock-info low"
                                            : "stock-info"
                                    }
                                >

                                    <span>
                                        Available
                                    </span>

                                    <strong>
                                        {available} {product.unit}
                                    </strong>

                                </div>


                                {product.rented > 0 && (

                                    <div className="rented-info">
                                        🔄 {product.rented} rented
                                    </div>

                                )}


                                {/* CUSTOMER ACTIONS */}

                                <div className="product-actions">

                                    {product.type !== "rental" && (

                                        <button
                                            className="btn btn-buy"
                                            onClick={() =>
                                                openMovement(
                                                    product,
                                                    "out"
                                                )
                                            }
                                        >
                                            🛒 Sell
                                        </button>

                                    )}

                                    {(product.type === "rental" ||
                                        product.type === "both") && (

                                        <button
                                            className="btn btn-rent"
                                            onClick={() =>
                                                openMovement(
                                                    product,
                                                    "rent"
                                                )
                                            }
                                        >
                                            🏗️ Rent
                                        </button>

                                    )}

                                </div>


                                {/* ADMIN ACTIONS */}

                                {isAdmin && showAdmin && (

                                    <div className="admin-actions">

                                        <button
                                            onClick={() =>
                                                setEditProduct({
                                                    ...product
                                                })
                                            }
                                        >
                                            ✏️ Edit Price
                                        </button>

                                        <button
                                            onClick={() =>
                                                openMovement(
                                                    product,
                                                    "in"
                                                )
                                            }
                                        >
                                            ➕ Stock IN
                                        </button>

                                        <button
                                            onClick={() =>
                                                openMovement(
                                                    product,
                                                    "out"
                                                )
                                            }
                                        >
                                            ➖ Stock OUT
                                        </button>

                                    </div>

                                )}

                            </div>

                        </div>

                    );
                })}

            </div>


            {/* STOCK / SALE MODAL */}

            {selectedProduct && (

                <div className="modal-overlay">

                    <div className="modal">

                        <button
                            className="modal-close"
                            onClick={() =>
                                setSelectedProduct(null)
                            }
                        >
                            ×
                        </button>

                        <h2>
                            {movementType === "in"
                                ? "Stock IN"
                                : movementType === "out"
                                ? "Sell Product"
                                : movementType === "rent"
                                ? "Rent Equipment"
                                : "Return Equipment"}
                        </h2>

                        <p>
                            {selectedProduct.name}
                        </p>

                        <label>
                            Quantity
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) =>
                                setQuantity(e.target.value)
                            }
                        />

                        <button
                            className="btn btn-primary full"
                            onClick={processStockMovement}
                        >
                            Confirm
                        </button>

                    </div>

                </div>

            )}


            {/* ADMIN PRICE MODAL */}

            {editProduct && (

                <div className="modal-overlay">

                    <div className="modal">

                        <button
                            className="modal-close"
                            onClick={() =>
                                setEditProduct(null)
                            }
                        >
                            ×
                        </button>

                        <h2>
                            Edit Product Pricing
                        </h2>

                        <p>
                            {editProduct.name}
                        </p>


                        <label>
                            Buying Price
                        </label>

                        <input
                            type="number"
                            value={editProduct.buyingPrice}
                            onChange={(e) =>
                                setEditProduct({
                                    ...editProduct,
                                    buyingPrice:
                                        Number(e.target.value)
                                })
                            }
                        />


                        <label>
                            Selling Price
                        </label>

                        <input
                            type="number"
                            value={editProduct.sellingPrice}
                            onChange={(e) =>
                                setEditProduct({
                                    ...editProduct,
                                    sellingPrice:
                                        Number(e.target.value)
                                })
                            }
                        />


                        <label>
                            Rental Price / Day
                        </label>

                        <input
                            type="number"
                            value={editProduct.rentalPrice}
                            onChange={(e) =>
                                setEditProduct({
                                    ...editProduct,
                                    rentalPrice:
                                        Number(e.target.value)
                                })
                            }
                        />


                        <button
                            className="btn btn-primary full"
                            onClick={updatePrice}
                        >
                            Save Pricing
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Products;