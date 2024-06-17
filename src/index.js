import myReact from "./myReact";

/** @jsx myReact.createElement */
function Counter() {
    const [num, setNum] = myReact.useState(0);
    return (
        <div>
            <h1 onClick={() => setNum((c) => c + 1)}>Count: {num}</h1>
        </div>
    );
}

const element = <Counter />;
const container = document.getElementById("root");
myReact.render(element, container);
