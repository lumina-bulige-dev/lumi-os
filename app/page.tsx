const homeState = await fetchHomeState();
const ui = toHomeUiState(homeState);

<button onClick={openWise}>Wise で送金する</button>
