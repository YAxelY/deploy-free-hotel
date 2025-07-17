import Navbar from '../navbar/navbar';
import BookingForm from '../bookingForm/bookingForm.jsx'
import './header.css'



function Header() {

    return (
        <div class="header">
            <Navbar />
            <section className="header-container">
                <div className="header-image-container">
                    <div className="header-content">
                        <h1>Enjoy your Dream Vacation</h1>
                        <p>Book Hotels and Stay Packages at Lowest Price.</p>
                    </div>
                    {/* <BookingForm /> */}
                </div>
            </section>
        </div>
    )
}

export default Header;