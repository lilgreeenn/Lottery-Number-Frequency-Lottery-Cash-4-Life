// script.js

// Helper function to normalize numbers (e.g., '01' -> '1')
function normalizeNumber(num) {
    return String(Number(num));
  }
  
  // Load CSV data
  d3.csv("Lottery_Cash_4_Life_Winning_Numbers__Beginning_2014_20241213.csv").then(data => {
    const winningCounts = {};
    const cashballCounts = {};
  
    // Count Winning Numbers and Cash Ball frequencies
    data.forEach(row => {
      // Process Winning Numbers
      row["Winning Numbers"].split(" ").forEach(num => {
        const normalized = normalizeNumber(num);
        winningCounts[normalized] = (winningCounts[normalized] || 0) + 1;
      });
  
      // Process Cash Ball
      const normalizedCashBall = normalizeNumber(row["Cash Ball"]);
      cashballCounts[normalizedCashBall] = (cashballCounts[normalizedCashBall] || 0) + 1;
    });
  
    // Convert counts to arrays for sorting
    const winningData = Object.entries(winningCounts).map(([num, count]) => ({ num, count }));
    const cashballData = Object.entries(cashballCounts).map(([num, count]) => ({ num, count }));
  
    // Sort data by frequency (descending)
    winningData.sort((a, b) => b.count - a.count);
    cashballData.sort((a, b) => b.count - a.count);
  
    // Highlight top 5 numbers
    const topWinning = winningData.slice(0, 5).map(d => d.num);
    const topCashBall = cashballData.slice(0, 5).map(d => d.num);
  
    // Create bar charts
    createBarChart(winningData, "#winning-chart", topWinning, "Winning Numbers");
    createBarChart(cashballData, "#cashball-chart", topCashBall, "Cash Ball");
  });
  
  // Function to create a bar chart
  function createBarChart(data, chartId, highlightNumbers, label) {
    const svg = d3.select(chartId);
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const x = d3.scaleBand()
                .domain(data.map(d => d.num))
                .range([margin.left, width - margin.right])
                .padding(0.1);
  
    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.count)])
                .nice()
                .range([height - margin.bottom, margin.top]);
  
    svg.attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom]);
  
    svg.append("g")
       .attr("transform", `translate(0,${height - margin.bottom})`)
       .call(d3.axisBottom(x).tickSizeOuter(0))
       .selectAll("text")
       .attr("transform", "rotate(-45)")
       .style("text-anchor", "end");
  
    svg.append("g")
       .attr("transform", `translate(${margin.left},0)`)
       .call(d3.axisLeft(y));
  
    // Add bars
    const bars = svg.selectAll(".bar")
       .data(data)
       .join("rect")
       .attr("class", d => highlightNumbers.includes(d.num) ? "bar highlight" : "bar")
       .attr("x", d => x(d.num))
       .attr("y", d => y(d.count))
       .attr("width", x.bandwidth())
       .attr("height", d => height - margin.bottom - y(d.count));
  
    // Tooltip
    const tooltip = d3.select("body").append("div")
                      .attr("class", "tooltip")
                      .style("position", "absolute")
                      .style("background", "lightgray")
                      .style("padding", "5px")
                      .style("border-radius", "5px")
                      .style("visibility", "hidden");
  
    bars.on("mouseover", (event, d) => {
         tooltip.style("visibility", "visible")
                .text(`Number: ${d.num}, Frequency: ${d.count}`);
         d3.select(event.currentTarget).attr("fill", "orange");
       })
       .on("mousemove", event => {
         tooltip.style("top", `${event.pageY - 20}px`)
                .style("left", `${event.pageX + 10}px`);
       })
       .on("mouseout", event => {
         tooltip.style("visibility", "hidden");
         d3.select(event.currentTarget).attr("fill", d => highlightNumbers.includes(d.num) ? "orange" : "steelblue");
       });
  
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 100},${margin.top})`);
  
    legend.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 20)
          .attr("height", 20)
          .attr("fill", "orange");
  
    legend.append("text")
          .attr("x", 25)
          .attr("y", 15)
          .text("Top 5 Numbers")
          .style("font-size", "12px")
          .attr("alignment-baseline", "middle");
  
    legend.append("rect")
          .attr("x", 0)
          .attr("y", 30)
          .attr("width", 20)
          .attr("height", 20)
          .attr("fill", "steelblue");
  
    legend.append("text")
          .attr("x", 25)
          .attr("y", 45)
          .text("Other Numbers")
          .style("font-size", "12px")
          .attr("alignment-baseline", "middle");
  }
  