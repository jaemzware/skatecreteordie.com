import { useState } from 'react';
import '../App.css';

function Donate(props) {
    const [selectedAmount, setSelectedAmount] = useState(1.05);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customAmount, setCustomAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');

    const handleSuggestedAmount = () => {
        setSelectedAmount(1.05);
        setShowCustomInput(false);
        setCustomAmount('');
    };

    const handleCustomToggle = () => {
        setShowCustomInput(true);
        setSelectedAmount(parseFloat(customAmount) || 1.05);
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value;
        setCustomAmount(value);
        setSelectedAmount(parseFloat(value) || 1.05);
    };

    const handleDonate = async () => {
        setIsProcessing(true);
        setMessage('');

        try {
            const response = await fetch(process.env.REACT_APP_DONATE_CREATE_PAYMENT_INTENT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Math.round(selectedAmount * 100) // Convert to cents
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Here you would integrate with Stripe Elements to complete payment
                // For now, we'll just show success
                setMessage(`Payment intent created for $${selectedAmount.toFixed(2)}`);
                console.log('Client Secret:', data.clientSecret);
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (error) {
            setMessage(`Network error: ${error.message}`);
        }

        setIsProcessing(false);
    };

    return (
        <div className="donate-container">
            <div className="donation-form">
                <h3>Support Development</h3>

                <div className="amount-options">
                    <button
                        className={`suggested-amount ${!showCustomInput ? 'active' : ''}`}
                        onClick={handleSuggestedAmount}
                        disabled={isProcessing}
                    >
                        $1.05 (suggested)
                    </button>
                    <button
                        className={`custom-toggle ${showCustomInput ? 'active' : ''}`}
                        onClick={handleCustomToggle}
                        disabled={isProcessing}
                    >
                        Custom Amount
                    </button>
                </div>

                {showCustomInput && (
                    <div className="custom-input">
                        <label htmlFor="custom-amount">Custom Amount: $</label>
                        <input
                            type="number"
                            id="custom-amount"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            min="1"
                            step="0.01"
                            placeholder="5.00"
                            disabled={isProcessing}
                        />
                    </div>
                )}

                <div className="amount-display">
                    <p>Donation Amount: <strong>${selectedAmount.toFixed(2)}</strong></p>
                </div>

                <button
                    id="donate-btn"
                    onClick={handleDonate}
                    disabled={isProcessing || selectedAmount < 1}
                >
                    {isProcessing ? 'Processing...' : 'Donate'}
                </button>

                {message && (
                    <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Donate;