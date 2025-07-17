import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './signUp.css'

const SignUp = () => {
    const [selectedOption, setSelectedOption] = useState('');
    const navigate = useNavigate();

    const handleNavigate = () => {
        if (selectedOption) {
            navigate(`/${selectedOption}`);
        }
    };

    return (
        <div class="signUp-form-container">
            <form action="">
                <h2 class="section-header signUp-form-header">Sign Up</h2>
                <div class="signUp-content">
                    <h3 class="section-subheader">Register As</h3>
                    <div class="radio-container">
                        <label for="client">
                            <input type="radio" name="user" value="client" onChange={(e) => setSelectedOption(e.target.value)} />
                            <span>A Client</span>
                        </label>
                        <label for="owner">
                            <input type="radio" name="user" value="owner" onChange={(e) => setSelectedOption(e.target.value)} />
                            <span>A Hotel Owner</span>
                        </label>
                    </div>
                    <div class="buttons">
                        <button class="link btn" onClick={handleNavigate} disabled={!selectedOption}>Register</button>
                        <Link to="/" class="link btn">Cancel</Link>
                    </div>
                    <div class="form-link">
                        <Link to="/login" class="link"><p>Already have an account? <span>Login</span></p></Link>
                    </div>
                </div>
            </form>

        </div>


  )
} 


export default SignUp;

