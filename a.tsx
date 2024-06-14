const Foo = () => {
  const [count, setCount] = useState(0)
  const [count2, setCount2] = useState(0)
  return <Bar x={Math.random()} />
}

// Bar 컴포넌트
// <Bar /> 엘리먼트, `ReactNode` (엘리멘터, view)

const Bar = () => {
  // 
  // return <div></div>
  return "asdfds"
}

// 상태 (state) = state + Props
// component: (state, props) -> view(element)
// component는 state를 input으로 view를 output 뱉는 함수이다


4 + 2 = 6