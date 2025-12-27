<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>3D支出グラフ（インタラクティブ）</title>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body style="background:#111; color:white;">
  <h2 style="text-align:center;">📈 12月支出推移（3D操作可能）</h2>
  <div id="graph" style="width:100%;height:500px;"></div>

  <script>
    // 日付データ
    const days = [...Array(31).keys()].map(i => i + 1);
    const spending = days.map(() => Math.floor(Math.random() * 12000) + 3000);

    const trace = {
      x: days,
      y: spending,
      z: days.map(d => d * 0.2),
      mode: 'lines+markers',
      type: 'scatter3d',
      line: { color: '#00bfff', width: 6 },
      marker: { size: 4, color: '#00bfff' },
    };

    const layout = {
      paper_bgcolor: '#111',
      scene: {
        xaxis: { title: '日付', color: '#ccc' },
        yaxis: { title: '支出（JPY）', color: '#ccc' },
        zaxis: { title: '推移', color: '#ccc' },
      }
    };

    Plotly.newPlot('graph', [trace], layout);
  </script>
</body>
</html>
