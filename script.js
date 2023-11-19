async function ping() {
  postResource('ping');
}

function pong() {
  postResource('pong');
}

async function postResource(resName) {
  try {
    const response = await fetch('http://localhost:8080/' + resName, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
  } catch (error) {
    console.error(error);
  }
}

async function getResourceCount(resName) {
  try {
    const response = await fetch('http://localhost:8080/' + resName);
    const data = await response.json();
    const resCountElement = document.getElementById(resName + 'Count');
    resCountElement.innerHTML = resName.toUpperCase() + 's: ' + data.count;
  } catch (error) {
    console.error('Error fetching ' + resName + ' count:', error);
  }
}
