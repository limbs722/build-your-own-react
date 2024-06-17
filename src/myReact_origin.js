// 1. createElement
// type, props, children 을 갖는 element를 만드는 함수
function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map((child) => {
                typeof child == "object" ? child : createTextElement(child);
            }),
        },
    };
}

// children이 *원시값일 때 처리하는 wrap 함수
// *원시값: 기본 타입 string, number, boolean 등등..
function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
    };
}

// const myReact = {
//     createElement,
// };

// element 생성
// const element = myReact.createElement(
//     "div",
//     { id: "foo" },
//     myReact.createElement("a", null, "bar"),
//     myReact.createElement("b")
// );

/** @jsx myReact.createElement */
// const element = (
//   <div id="foo">
//     <a>bar</a>
//     <b />
//   </div>
// );

// 2. render
// => DOM node 만들기
// => type 정하기
// => container 에 추가하기
// => 자식들도 element 생성(재귀)
// => Text element 제외 처리
// => element 의 children 외 props들 DOM node 에 추가해주기
// function render(element, container) {
//     const dom =
//         element.type == "TEXT_ELEMENT"
//             ? document.createTextNode("")
//             : document.createElement(element.type);

//     const isProperty = (key) => key !== "children";

//     Object.keys(element.props)
//         .filter(isProperty)
//         .forEach((name) => {
//             dom[name] = element.props[name];
//         });

//     element.props.children.forEach((child) => render(child, dom));

//     container.appendChild(dom);
// }

// 3. concurrent Mode (동시성 모드)
// => 만약 element 들이 너무 크다면 메인 스레드의 동작이 너무 오랫동안 멈출 수 있다.
// => 작업들을 더 작은 단위로 나눠 브라우저의 필요에 따라 렌더링 도중에 끼어들 수 있도록 함.
let nextUnitOfWork = null;

function workLoop(deadline) {
    let shouldYield = false;

    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }

    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }
    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
    const isFunctionComponent = fiber.type instanceof Fuction;

    if (isFunctionComponent) {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
    }

    if (fiber.child) {
        return fiber.child;
    }

    let nextFiber = fiber;

    while (nextFiber) {
        if (nextFiber.sibling) {
            return newFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
}

// 4. fibers
// 위의 실행 단위를 관리하기 위한 자료구조
// element 마다 fiber를 가지게 되고, 이 fiber가 하나의 실행 단위.
// myReact.render(
//     <div>
//         <h1>
//             <p />
//             <a />
//         </h1>
//         <h2 />
//     </div>,
//     container
// );
// render 함수는 root fiber를 만들고 첫 nextUnitOfWork로 설정.
// 이후 작업들은 performUnitOfWork에서 실행될 것이고 다음과 같다.
// 1. DOM에 element 달기
// 2. children 에 대한 fiber 생성
// 3. 다음 실행 단위 설정
// 이 자료 구조의 핵심은 다음 실행 단위를 쉽게 찾기 위함이다.
// fiber 들은 다음과 같은 규칙을 가진다.
//    * 먼저 자식 있다면, 다음 실행 단위가 된다.
//    * 자식이 없다면 형제가 실행 단위가 된다.
//    * 둘 다 없다면 '삼촌'이 실행 단위가 된다. 즉 형제의 부모를 말한다.

// render 함수에서 DOM 만드는 부분을 따로 함수화
function createDom(fiber) {
    const dom =
        fiber.type == "TEXT_ELEMENT"
            ? document.createTextNode("")
            : document.createElement(fiber.type);

    const isProperty = (key) => key !== "children";

    Object.keys(fiber.props)
        .filter(isProperty)
        .forEach((name) => {
            dom[name] = fiber.props[name];
        });

    return dom;
}

// render 함수는 이제 nextUnitOfWork 를 root의 fiber tree 로 설정한다.
// function render(element, container) {
//     nextUnitOfWork = {
//         dom: container,
//         props: {
//             children: [element],
//         },
//     };
// }

// 브라우저가 준비되면 workLoop 를 호출해 root 부터 작업을 시작할 것.
// 먼저 새 node를 만들어 dom에 붙이고,
// 자식들에 대해 fiber를 생성한다.
// 첫 자녀는 자녀로 연결하고, 나머지들은 서로 형제로 연결.
// 마지막으로 다음 실행 단위를 찾고 반환.
// function performUnitOfWork(fiber) {
//     // DOM 이 생성되어 있는지 체크 후 없다면 생성
//     if (fiber.dom) {
//         fiber.dom = createDom(fiber);
//     }

//     // 부모와 자식을 연결
//     // if (fiber.parent) {
//     //     fiber.parent.dom.appendChild(fiber.dom);
//     // }
//     // => 삭제

//     const elements = fiber.props.children;
//     let index = 0;
//     let prevSibling = null;

//     while (index < elements.length) {
//         const element = elements[index];

//         const newFiber = {
//             type: element.type,
//             props: element.props,
//             parent: fiber,
//             dom: null,
//         };

//         if (index == 0) {
//             fiber.child = newFiber;
//         } else {
//             prevSibling.sibling = newFiber;
//         }

//         prevSibling = newFiber;
//         index++;
//     }

//     if (fiber.child) {
//         return fiber.child;
//     }

//     let nextFiber = fiber;

//     while (nextFiber) {
//         if (nextFiber.sibling) {
//             return nextFiber.sibling;
//         }
//         nextFiber = nextFiber.parent;
//     }
// }

// 5. render and commit phases
// 만약 모든 DOM 을 그리기전에 브라우저가 제어권을 뺏어간다면 rendering이 끝나기전에 불완전한 UI를 보여주게 된다.
// => DOM 을 다루는 부분을 지우고
// => fiber tree 의 root 를 wiproot 라 이름 짓고 추적할 것.
// function render(element, container) {
//     wipRoot = {
//         dom: container,
//         props: {
//             children: [element],
//         },
//     };

//     nextUnitOfWork = wipRoot;
// }

// 다음 실행 단위가 없어, 모든 실행 단위가 끝이 나면 DOM에 commit 한다.
// 이를 commitRoot 함수에서 실행
// function workLoop(deadline) {
//     let shouldYield = false;
//     while (nextUnitOfWork && !shouldYield) {
//         nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
//         shouldYield = deadline.timeRemaining() < 1;
//     }

//     if (!nextUnitOfWork && wipRoot) {
//         commitRoot();
//     }

//     requestIdleCallback(workLoop);
// }

// 모든 작업이 끝나고 나면(더이상 다음 작업이 없을 때), 전체 fiber tree 를 DOM에 commit 한다.
function commitRoot() {
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}

function commitWork(fiber) {
    if (!fiber) {
        return;
    }

    let domParentFiber = fiber.parent;
    while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent;
    }

    const domParent = fiber.parent.dom;

    if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
        domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    } else if (fiber.effectTag === "DELETION") {
        commitDeletion(fiber, domParent);
    }

    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

// 6. reconciliation(재조정)
// node의 갱신과 삭제(update와 demounting)
// 마지막 추가한 fiber tree를 currentRoot로 저장.
// alternate 라는 프로퍼티를 fiber에 추가해 이를 기억하게 한다.
function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot,
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
}

function reconciliationChildren(wipFiber, elements) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling = null;

    while (index < elements.length || oldFiber != null) {
        const element = elements[index];
        let newFiber = null;

        const sameType = oldFiber && element && element.type == oldFiber.type;

        if (sameType) {
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
            };
        }
        if (element && !sameType) {
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
            };
        }
        if (oldFiber && !sameType) {
            oldFiber.effectTag = "DELETION";
            deletions.push(oldFiber);
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }

        if (index == 0) {
            fiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }

        prevSibling = newFiber;
        index++;
    }
}

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);

function updateDom(dom, prevProps, nextProps) {
    // remove old or changed event listerers
    Object.keys(prevProps)
        .filter(isEvent)
        .filter((key) => {
            !(key in nextProps) || isNew(prevProps, nextProps)(key);
        })
        .forEach((name) => {
            const eventType = name.toLowerCase().substring(2);
            dom.removeEventListner(eventType, prevProps[name]);
        });

    // remove old properties
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach((name) => {
            dom[name] = "";
        });

    // add new properties
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach((name) => {
            dom[name] = nextprops[name];
        });

    // add new event listeners
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach((name) => {
            const eventType = name.toLowerCase().substring(2);
            dom.addEventListener(eventType, prevProps[name]);
        });
}

// 7. function components
// => 함수형 컴포넌트의 차이점 :
//      1. fiber가 dom node를 갖지 않는다.
//      2. children props 에서 가져오는 것이 아니라 함수에서 바로 가져 온다.
// fiber의 타입을 체크해서 함수라면 다른 update 함수를 사용하도록 한다.
// updateHostComponent는 기존 함수와 같고, updateFunctionComponent는 함수로 자식을 가져오도록 할 것.
let wipFiber = null; // useState에 필요한 전역번수
let hookIndex = null; // uesState가 한 컴포넌트에서 여러번 호출되었을 때를 위한 hooks 배열

function updateFunctionComponent(fiber) {
    wipFiber = fiber;
    hookIndex = 0;
    wipFiber.hooks = [];

    const children = [fiber.type(fiber.props)];
    reconciliationChildren(fiber, children);
}

function updateHostComponent(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }
    reconciliationChildren(fiber, fiber.props.children);
}

function commitDeletion(fiber, domParent) {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber.child, domParent);
    }
}

// 8. hooks
// useState가 호출되면, 이전에 호출된 hook이 있다면 이전 hook에서 state를 복사해 온다.
// 새로운 hook을 fiber에 넣어주고 state를 반환한다.
// useState는 상태를 변환시키기 위한 함수를 반환해야한다. 그래서 setState를 선언해 action을 받도록 선언해야하고,
// 이 action을 hook의 Queue에 삽입한다.
// 그 다음의 실행단위들을 차근차근 실행 시키도록 한다.
// 이 action 들은 다음 렌더링을 할 때 old hook에 쌓여있던 action들이 실행되며 실행된다.
function useState(initial) {
    const oldHook =
        webFiber.alternate &&
        webFiber.alternate.hooks &&
        webFiber.alternate.hooks[hookIndex];

    const hook = { status: oldHook ? oldHook.state : initial, queue: [] };

    const action = oldHook ? oldHook.queue : [];
    action.forEach((action) => {
        hook.state = action(hook.state);
    });

    const setState = (action) => {
        hook.queue.pupsh(action);

        wipRoot = {
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot,
        };
        (nextUnitOfWork = wipRoot), (deletions = []);
    };

    wipFiber.hooks.push(hook);
    hookIndex++;

    return [hook.state, setState];
}

const myReact = {
    createElement,
    render,
    useState,
};

export default myReact;
