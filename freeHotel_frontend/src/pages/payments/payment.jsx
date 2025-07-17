import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './payment.css'
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { createPayment, createPaymentIntent } from '../../services/paymentApi';
import { updateHotel } from '../../services/hotelApi';
import { updateReservationStatus } from '../../services/reservationApi';

const stripePromise = loadStripe('pk_test_51RjzibBISrtjWJCXMcseCsw35u9eOoyjv4IlEWStmGM1vQ6505SOe3mW7WaYCoeWpGN1t8gO2FzoqwsK8e3PvRbS00FpijSwTz');

function PaymentForm() {
    const stripe = useStripe();
    const elements = useElements();
    const location = useLocation();
    const navigate = useNavigate();
    const plan = location.state?.plan;
    const hotelId = location.state?.hotelId;
    const reservationId = location.state?.reservationId;
    const reservationAmount = location.state?.amount;
    const reservationClientName = location.state?.client_name;
    const reservationClientEmail = location.state?.client_email;
    const returnTo = location.state?.returnTo || '/dashboard';
    // Pre-fill from localStorage or reservation
    const [fullName, setFullName] = useState(reservationClientName || localStorage.getItem('name') || '');
    const [email, setEmail] = useState(reservationClientEmail || localStorage.getItem('userEmail') || '');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Determine payment type and amount
    let amount = 0;
    let paymentType = '';
    if (plan) {
        amount = plan.price;
        paymentType = 'plan';
    } else if (reservationId) {
        amount = reservationAmount;
        paymentType = 'reservation';
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            // 1. Create Payment object in backend
            let paymentPayload = {};
            if (plan) {
                paymentPayload = {
                    hotel_id: hotelId,
                    plan_name: plan?.value || plan.name // fallback to name if value is missing
                };
            } else if (reservationId) {
                paymentPayload = {
                    reservation_id: reservationId,
                    hotel_id: hotelId,
                    payment_type: 'reservation' // Ensure correct endpoint is used
                };
            }
            console.log('Payment payload:', paymentPayload, 'Plan:', plan);
            const paymentData = await createPayment(paymentPayload);
            const payment_id = paymentData.id;

            // 2. Call backend to create PaymentIntent and get clientSecret
            const intentData = await createPaymentIntent({
                amount: Number(amount),
                currency: 'usd',
                payment_id: payment_id
            });
            const clientSecret = intentData.clientSecret;

            // 3. Confirm card payment with Stripe
            const cardElement = elements.getElement(CardNumberElement);
            const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: fullName,
                        email: email,
                        address: {
                            line1: address,
                            city: city,
                            state: state,
                            postal_code: zip
                        }
                    }
                }
            });
            if (stripeError) throw new Error(stripeError.message);
            if (paymentIntent.status === 'succeeded') {
                setSuccess('Payment successful!');
                // Update hotel status to 'published' in backend
                if (hotelId) {
                    await updateHotel(hotelId, { status: 'published' }, localStorage.getItem('token'));
                }
                // Update reservation status to 'SUCCESS' in backend
                if (reservationId) {
                    await updateReservationStatus(reservationId, 'SUCCESS', localStorage.getItem('token'));
                }
                setTimeout(() => {
                    navigate(returnTo);
                }, 2000);
            } else {
                setError('Payment failed.');
            }
        } catch (err) {
            setError(err.message || 'Payment failed.');
        }
        setLoading(false);
    };

    return (
        <>
            {plan && (
                <div className="plan-summary">
                    <h2>Selected Plan: {plan.name}</h2>
                    <div>Price: {plan.price === 0 ? 'Free' : `$${plan.price}/mo`}</div>
                    <div>{plan.desc}</div>
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <Link to="/" title="Cancel" className="close-payment">
                        <span><FontAwesomeIcon icon={['fas', 'fa-times']} /></span>
                    </Link>
                    <div className="column">
                        <h3 className="title">Billing Address</h3>
                        <div className="input-box">
                            <span>Full Name :</span>
                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
                        </div>
                        <div className="input-box">
                            <span>Email :</span>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="input-box">
                            <span>Address :</span>
                            <input type="text" value={address} onChange={e => setAddress(e.target.value)} />
                        </div>
                        <div className="input-box">
                            <span>City :</span>
                            <input type="text" value={city} onChange={e => setCity(e.target.value)} />
                        </div>
                        <div className="flex">
                            <div className="input-box">
                                <span>State :</span>
                                <input type="text" value={state} onChange={e => setState(e.target.value)} />
                            </div>
                            <div className="input-box">
                                <span>Zip Code :</span>
                                <input type="number" value={zip} onChange={e => setZip(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="column">
                        <h3 className="title">Payment</h3>
                        {/* <div className="input-box">
                            <span>Cards Accepted :</span>
                            <img src="imgcards.png" alt="" />
                        </div> */}
                        <div className="input-box">
                            <span>Card Number :</span>
                            <div className="stripe-card-element styled-stripe-input" style={{ border: '1px solid #767268', padding: '10px 15px', borderRadius: '6px' }}>
                                <CardNumberElement options={{ style: { base: { fontSize: '16px' } } }} />
                            </div>
                        </div>
                        <div className="flex">
                            <div className="input-box">
                                <span>Expiry Date :</span>
                                <div className="stripe-card-element styled-stripe-input" style={{ border: '1px solid #767268', padding: '10px 15px', borderRadius: '6px' }}>
                                    <CardExpiryElement options={{ style: { base: { fontSize: '16px' } } }} />
                                </div>
                            </div>
                            <div className="input-box">
                                <span>CVC :</span>
                                <div className="stripe-card-element styled-stripe-input" style={{ border: '1px solid #767268', padding: '10px 15px', borderRadius: '6px', width: '60px' }}>
                                    <CardCvcElement options={{ style: { base: { fontSize: '16px' } } }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <div className="buttons">
                    <button type="submit" className="btn" disabled={!stripe || loading}>{loading ? 'Processing...' : 'Submit'}</button>
                    <Link to="/" className="btn" style={{ textDecoration: 'none' }}>Cancel</Link>
                </div>
            </form>
        </>
    );
}

function Payment() {
    return (
        <div className="payment">
            {/* <Navbar /> */}
            <section className="payment-container-form">
                <PaymentForm />
            </section>
            {/* <Footer /> */}
        </div>
    )
}

export default function PaymentWithStripeProvider() {
    return (
        <Elements stripe={stripePromise}>
            <Payment />
        </Elements>
    );
}