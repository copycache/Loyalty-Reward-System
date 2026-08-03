"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import { resolveAssetUrl } from "@/lib/api";

export function CartSheet({ children }: { children: ReactNode }) {
  const { cartItems, total, cartCount, changeQty, removeFromCart, openCart, closeCart, isOpen } =
    useCartStore();

  return (
    <>
      <span onClick={openCart}>{children}</span>

      {isOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCart();
          }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fa fa-shopping-cart"></i> Shopping Cart
                </h5>
                <button type="button" className="close" onClick={closeCart}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="cart-container">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      {cartItems.length > 0 && (
                        <thead>
                          <tr>
                            <th className="text-center">No.</th>
                            <th className="text-center">Image</th>
                            <th className="text-center">Product Name</th>
                            <th className="text-center">Unit Price</th>
                            <th className="text-center" width="100px">Quantity</th>
                            <th className="text-center">Subtotal</th>
                            <th className="text-center" style={{ width: 15 }}></th>
                          </tr>
                        </thead>
                      )}
                      {cartItems.length === 0 ? (
                        <tbody>
                          <tr>
                            <td>
                              <div className="cart-empty">
                                <i className="fa fa-cart-plus"></i>
                                <br />
                                <span><b>Your cart is empty!</b></span>
                                <br />
                                You have no items in your shopping cart.
                                <br />
                                Let&apos;s go buy something
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      ) : (
                        <tbody>
                          {cartItems.map((item, i) => (
                            <tr key={item.item_id} className="items">
                              <td className="text-center align-middle">{i + 1}</td>
                              <td className="text-center align-middle" style={{ width: "24%" }}>
                                {item.item_thumbnail && (
                                  <Image
                                    src={resolveAssetUrl(item.item_thumbnail)}
                                    alt={item.item_sku}
                                    width={80}
                                    height={80}
                                    style={{ width: "auto", height: "auto" }}
                                  />
                                )}
                              </td>
                              <td className="text-center align-middle">{item.item_sku}</td>
                              <td className="text-center align-middle">
                                PHP {(item.item_price || 0).toFixed(2)}
                              </td>
                              <td className="text-center align-middle">
                                <input
                                  min="1"
                                  className="form-control form-control-sm text-center"
                                  type="number"
                                  value={item.item_qty}
                                  onChange={(e) =>
                                    changeQty(item.item_id, parseInt(e.target.value) || 1)
                                  }
                                  style={{
                                    width: "80px",
                                    margin: "0 auto",
                                    borderRadius: 0,
                                    border: "1px solid #ccc",
                                    padding: "5px",
                                  }}
                                />
                              </td>
                              <td className="text-center align-middle">
                                <b>
                                  PHP {((item.discounted_price || item.item_price || 0) * item.item_qty).toFixed(2)}
                                </b>
                              </td>
                              <td
                                className="text-center red align-middle"
                                style={{ padding: 15, cursor: "pointer", color: "red" }}
                                onClick={() => removeFromCart(item.item_id)}
                              >
                                <i className="fa fa-trash"></i>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      )}
                      <tfoot>
                        <tr className={cartItems.length === 0 ? "hide" : ""}>
                          <th className="text-right align-center" colSpan={5}>
                            TOTAL
                          </th>
                          <th className="text-center align-center" style={{ color: "var(--primary-color)" }}>
                            PHP {total.toFixed(2)}
                          </th>
                          <th></th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeCart}
                >
                  <i className="fa fa-close"></i> Close
                </button>
                {cartItems.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      closeCart();
                      window.location.href = "/product/checkout";
                    }}
                  >
                    <i className="fa fa-check"></i> Checkouts
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
        }

        .modal-dialog {
          width: 100%;
          max-width: 1140px;
          margin: 30px auto;
          padding: 0 15px;
        }

        .modal-content {
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 0;
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px;
          background: var(--primary-color);
          color: #fff;
          font-weight: 700;
          border-radius: 0;
        }

        .modal-title {
          margin: 0;
          font-size: 1.25rem;
        }

        .close {
          background: none;
          border: none;
          color: #fff;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 1;
          padding: 0;
          line-height: 1;
        }

        .modal-body {
          position: relative;
          flex: 1;
          padding: 15px;
        }

        .table {
          width: 100%;
          margin-bottom: 1rem;
          color: #333;
          border-collapse: collapse;
        }

        .table th,
        .table td {
          padding: 0.75rem;
          vertical-align: top;
          border-top: 1px solid #dee2e6;
        }

        .table thead th {
          vertical-align: bottom;
          border-bottom: 2px solid #dee2e6;
        }

        .text-center {
          text-align: center;
        }

        .text-right {
          text-align: right;
        }

        .align-middle {
          vertical-align: middle;
        }

        .align-center {
          vertical-align: middle;
        }

        .form-control {
          display: block;
          width: 100%;
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          line-height: 1.5;
          color: #495057;
          background-color: #fff;
          border: 1px solid #ced4da;
          border-radius: 0;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }

        .form-control-sm {
          height: calc(1.5em + 0.5rem + 2px);
          padding: 0.25rem 0.5rem;
          font-size: 0.7875rem;
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 15px;
          border-top: 1px solid #dee2e6;
          gap: 10px;
        }

        .btn {
          display: inline-block;
          font-weight: 400;
          text-align: center;
          vertical-align: middle;
          cursor: pointer;
          border: 1px solid transparent;
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          line-height: 1.5;
          border-radius: 0;
          transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
          text-decoration: none;
        }

        .btn-secondary {
          color: #fff;
          background-color: #6c757d;
          border-color: #6c757d;
        }

        .btn-primary {
          color: #fff;
          background-color: var(--primary-color);
          border-color: var(--primary-color);
        }

        .cart-empty {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 30px;
          flex-direction: column;
          color: gray;
          text-align: center;
        }

        .cart-empty i {
          font-size: 120px;
          color: gray;
          margin: 5px 0;
        }

        .cart-empty span {
          margin: 5px 0;
          font-size: 24px;
          color: black;
        }

        .hide {
          display: none;
        }

        .red {
          color: red;
        }

        .items:hover {
          background-color: #f5f5f5;
        }

        .table-responsive {
          display: block;
          width: 100%;
          overflow-x: auto;
        }
      `}</style>
    </>
  );
}
