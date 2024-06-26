/** @jsx createElement */
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

function Calculator() {
    const [value, setValue] = myReact.useState(0);

    const handleInputChange = (event) => {
        setValue(Number(event.target.value));
    };

    const result = 3 + value;

    return (
        <div>
            <h1>
                3 + {value} = {result}
            </h1>
            <input type="number" value={value} onChange={handleInputChange} />
        </div>
    );
}

function Greeting({ name }) {
    console.log("Greeting was rendered at", new Date().toLocaleTimeString());
    return (
        <div>
            <h3>
                Hello{name && ", "}
                {name}!
            </h3>
        </div>
    );
}

const MemoizedGreeting = myReact.memo(Greeting, (prevProps, nextProps) => {
    return prevProps.name === nextProps.name;
});

function MemoizedCalculator({ value }) {
    const result = myReact.useMemo(() => {
        console.log("Calculating...");
        return value * value;
    }, [value]);

    return <div>Result: {result}</div>;
}

function App() {
    const [name, setName] = myReact.useState("");
    const [address, setAddress] = myReact.useState("");
    const [count, setCount] = myReact.useState(0);

    const handleInputChange = (event) => {
        setCount(Number(event.target.value));
    };

    return (
        <div>
            <div>
                <label>
                    Name{": "}
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>
                <label>
                    Address{": "}
                    <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </label>
            </div>
            {/* <h1>
                3 + {value} = {result}
            </h1> */}
            <input type="number" value={count} onChange={handleInputChange} />
            <MemoizedCalculator value={count} />
            {/* <MemoizedGreeting name={name} /> */}
        </div>
    );
}

const element = <App />;
const container = document.getElementById("root");
myReact.render(element, container);
