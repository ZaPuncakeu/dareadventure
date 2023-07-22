import { Swal } from "../../SweetAltert";
import { useLanguage } from "../../hooks/useLanguage";
import Navbar from "./Navbar";
import './style.css'

export default function Home() {
    const { text } = useLanguage();
    console.log(text);

    function warning() {
        Swal.fire({
            title: <strong className="home-swal-title lobster">{text.Home.careful}</strong>,
            html: <span className="lexend justify">{text.Home.warning}</span>,
            icon: 'warning',
            confirmButtonText: <>{text.Home.warningButton}</>
        }).then((result:any) => {
            if (result.isConfirmed) {
                location.href = "/meet";
            }
        })
    }

    return(
        <div id="home">
            {/*<Navbar/>*/}
            <div className="foreground">
                <div>
                    <h1 className="lobster">
                        {text.Home.title}
                    </h1>
                    <p className="lexend">
                        {text.Home.subtitle}
                    </p>
                    <br />
                    <button className="start lobster" onClick={warning}>
                        {text.Home.start}
                    </button>
                </div>
            </div>
        </div>
    )
}