import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js'
import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
)

interface PriceChartProps {
  price: number
  priceChange?: number
  symbol: string
  color: string
}

export function PriceChart({ price, priceChange, symbol, color }: PriceChartProps) {
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    // Generate mock historical data based on current price and change
    const generateMockData = () => {
      const dataPoints = 24 // 24 hours of data
      const data: number[] = []
      const labels: string[] = []
      
      // Start from 24 hours ago and work to current price
      const changePerHour = (priceChange || 0) / 24
      const startPrice = price - (priceChange || 0)
      
      for (let i = 0; i < dataPoints; i++) {
        const hourPrice = startPrice + (changePerHour * i) + (Math.random() - 0.5) * price * 0.02
        data.push(Math.max(0, hourPrice))
        
        const hour = (24 - dataPoints + i) % 24
        labels.push(`${hour}:00`)
      }
      
      // Ensure the last point is the current price
      data[data.length - 1] = price
      
      return { data, labels }
    }

    const { data, labels } = generateMockData()

    setChartData({
      labels,
      datasets: [
        {
          label: `${symbol} Price`,
          data,
          borderColor: color,
          backgroundColor: `${color}20`,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
        },
      ],
    })
  }, [price, priceChange, symbol, color])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: color,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }

  if (!chartData) {
    return (
      <div className="h-32 glass rounded-lg flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading chart...</div>
      </div>
    )
  }

  return (
    <div className="h-32 glass rounded-lg p-2">
      <Line data={chartData} options={options} />
    </div>
  )
}