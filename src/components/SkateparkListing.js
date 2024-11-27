import '../App.css';
import SkateparkView from "./SkateparkView";

function SkateparkListing(props){
    return (
        <>
            <table id="skateparks">
                {props.fileListingArray.map((value, index) =>
                    <tr>
                        <td className="skatepark">
                            <SkateparkView id={"skateparkView"+index} key={"skateparkView"+index} index={index} value={value} />
                        </td>
                    </tr>)}
            </table>
        </>
    );
}

export default SkateparkListing;
