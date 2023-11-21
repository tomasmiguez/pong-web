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

    if (data.error) {
      setResourceCount(resName, data.error);
    } else {
      setResourceCount(resName, data.count);
    }
  } catch (error) {
    console.error('Error fetching ' + resName + ' count:', error);
  }
}

function setResourceCount(resName, count) {
  const resCountElement = document.getElementById(resName + 'Count');

  if (resCountElement) {
    resCountElement.innerHTML = resName.toUpperCase() + 's: ' + count;
  }
}

function setupWebsocket(resName) {
      var mySocket = new WebSocket("ws://localhost:8080/ws");

      mySocket.onmessage = function (event) {
        var output = document.getElementById("output");
        dataJson = JSON.parse(event.data);

        if (dataJson.type == resName) {
          setResourceCount(resName, dataJson.newCount);
        }
      };
}

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    } catch (error) {
      console.error('Failed to register service worker:', error);
    }
  }
}
