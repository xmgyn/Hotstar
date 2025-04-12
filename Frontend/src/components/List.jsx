import Card from './Card'
import Left from '../assets/Left'

function List({ className }) {
    return (
        <div className={className}>
            <div className="Card-Heading">
                <div className="Text-Heading oxygen-bold">Collections</div>
                <div className="Navigate">
                    <div className="Arrow-Left"><Left /></div>
                    <div className="Arrow-Right"><Left /></div>
                </div>
            </div>
            <div className="Horizontal-Card">
                <Card className="Preview-Card" image="/stretch.jpg"/>
                <Card image="/frozen.jpeg"/>
                <Card image="/frozen.jpeg"/>
                <Card image="/frozen.jpeg"/>
                <Card image="/frozen.jpeg"/>
                <Card image="/frozen.jpeg"/>
                <Card image="/frozen.jpeg"/>
                <Card image="/frozen.jpeg"/>
                <Card image="/frozen.jpeg"/>
                <Card image="/frozen.jpeg"/>
                <Card image="/frozen.jpeg"/>
                <Card image="/frozen.jpeg"/>
                <Card image="/frozen.jpeg"/>
                <Card image="/frozen.jpeg"/>
                <Card image="/frozen.jpeg"/>
                <Card image="/frozen.jpeg"/>
                <Card className="End-Card" image="/frozen.jpeg"/>
            </div>
        </div>
    )
}

export default List