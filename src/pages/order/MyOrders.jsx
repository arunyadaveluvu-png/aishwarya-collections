import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (!user) return;

        const { data } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        setOrders(data || []);
    };

    return (
        <div style={{ padding: "4rem" }}>
            <h2>My Orders</h2>

            {orders.length === 0 ? (
                <p>No orders yet</p>
            ) : (
                orders.map(order => (
                    <div
                        key={order.id}
                        style={{
                            padding: "15px",
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            marginBottom: "15px",
                            cursor: "pointer"
                        }}
                        onClick={() => navigate(`/account/orders/${order.id}`)}
                    >
                        <p><strong>Order ID:</strong> {order.id}</p>
                        <p><strong>Total:</strong> ₹{order.total}</p>
                        <p><strong>Status:</strong> {order.status}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default MyOrders;