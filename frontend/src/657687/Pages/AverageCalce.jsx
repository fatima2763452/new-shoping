import React, { useState } from "react";
import NavBar from "../Components/NavBar"
import Button from '@mui/material/Button';
function AverageCalce() {
    const [entries, setEntries] = useState([{ qty: "", price: "" }]);
    const [average, setAverage] = useState(null);

    // Add a new empty entry
    const addEntry = () => {
        setEntries([...entries, { qty: "", price: "" }]);
    };

    // Update value of a specific input
    const handleChange = (index, field, value) => {
        const newEntries = [...entries];
        newEntries[index][field] = value;
        setEntries(newEntries);
    };

    // Calculate average buy price
    const calculateAverage = () => {
        let totalQty = 0;
        let totalCost = 0;

        entries.forEach((entry) => {
            const qty = parseFloat(entry.qty);
            const price = parseFloat(entry.price);

            if (!isNaN(qty) && !isNaN(price)) {
                totalQty += qty;
                totalCost += qty * price;
            }
        });

        const avg = totalQty > 0 ? (totalCost / totalQty).toFixed(2) : 0;
        setAverage(avg);
    };

    return (
        <>
            <NavBar />

            <div style={{ padding: "20px", fontFamily: "Arial" }}>
                <h3 className="text-muted fm-bold">Average Buy Price Calculator</h3>

                <div
                    className="average-entries-scroll"
                    style={{
                        maxHeight: "480px",
                        overflowY: "auto",
                        overflowX: "hidden", 
                        width: "100%",      
                        position: "relative",
                        marginBottom: "20px"
                    }}
                >
                    {entries.map((entry, index) => (
                        <div className="row" key={index} style={{ marginBottom: "10px" }}>
                            <div className="col-md-6 col-12">
                                <label htmlFor="qty" className="form-label text-muted">Quantity:</label>
                                <input
                                    type="number"
                                    id="qty"
                                    value={entry.qty}
                                    onChange={(e) => handleChange(index, "qty", e.target.value)}
                                    className="form-control text-muted"
                                />
                            </div>
                            <div className="col-md-6 col-12">
                                <label htmlFor="buyPrice" className="form-label text-muted"> Buy Price:</label>
                                <input
                                    id="buyPrice"
                                    type="number"
                                    value={entry.price}
                                    onChange={(e) => handleChange(index, "price", e.target.value)}
                                    className="form-control text-muted"
                                />
                            </div>
                        </div>
                    ))}
                    {/* Top blur shadow */}
                    <div className="scroll-blur-top"></div>
                    {/* Bottom blur shadow */}
                    <div className="scroll-blur-bottom"></div>
                </div>

                <div className="row" style={{ gap: "10px" }}>
                    <div className="col-12 col-md-6 mb-2">
                        <Button
                            variant="contained"
                            type="button"
                            fullWidth
                            size="large"
                            onClick={addEntry}
                        >
                            Add Another Entry
                        </Button>
                    </div>
                    <div className="col-12 col-md-6 mb-2">
                        <Button
                            variant="contained"
                            type="button"
                            fullWidth
                            size="large"
                            onClick={calculateAverage}
                        >
                            Calculate Average
                        </Button>
                    </div>
                </div>

                {average !== null && (
                    <h3 style={{ marginTop: "20px" }} className="text-muted">Average Buy Price: ₹{average}</h3>
                )}
            </div>
        </>
    );
}

export default AverageCalce;
