import { useState, useRef, useEffect, MutableRefObject } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { months } from './MonthlyChart';

const seasons:string[] = ['Sp', 'S', 'F', 'W'];

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
);

type LineChartProps = { data: any, handleButtonClick: Function };
function LineChart({ data, handleButtonClick }:LineChartProps):JSX.Element {
  /* Color Properties */
  const primary = 'rgba(75,192,192,0.5)';
  const secondary = 'rgba(255,255,255,0.5)';
  const accent = 'black';
  const fontColor = 'white';
  const secondaryFontColor = 'rgba(200,200,200)';
  const accentFontColor = 'rgba(75,192,192,1)';
  // These variables are used to detect any changes on 
  // the screen.
  let gradient:CanvasGradient, width:number, height:number;
  /**
   * A callback function that fills the background color of 
   * the chart with a canvas gradient.
   * It gets activated when the chart is mounted on the screen.
   */
  const gradientFill = (context:any) => {
    const chart = context.chart;
    const {ctx, chartArea} = chart;
    if (!chartArea) {
      // This case happens on initial chart load
      return;
    }
    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;
    if (!gradient || width !== chartWidth || height !== chartHeight) {
      // Create the gradient because this is either the first render
      // or the size of the chart has changed
      width = chartWidth;
      height = chartHeight;
      gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      gradient.addColorStop(0, primary);
      gradient.addColorStop(1, secondary);
    }
    return gradient;
  }

  /**
   * Intercept the chart data and add more 
   * customized fields in it.
   */
  const decorateData = (data:any) => {
    let copy = data;
    copy.datasets = [{
      ...data.datasets[0],
      fill: true,
      backgroundColor: gradientFill,
      borderColor: primary,
      tension: 0.5,
      pointStyle: 'circle',
      pointBackgroundColor: 'transparent',
      pointBorderColor: 'transparent',
      pointHitRadius: 30,
      pointRadius: 10,
      pointHoverBackgroundColor: primary,
      pointHoverRadius: 5,
    }, {
      ...data.datasets[1],
      borderColor: secondaryFontColor,
      pointBackgroundColor: 'transparent',
      pointBorderColor: 'transparent',
    }];
    return copy;
  }

  // Button Group Controller
  let buttonIndexMem:number = -1;
  const [buttonIndex, setButtonIndex] = useState(2);
  const buttonValues:string[] = ['3y', '1y', '6m', '3m', '1m'];
  let buttonRefs:MutableRefObject<HTMLButtonElement|null>[] = 
    [useRef<HTMLButtonElement>(null), 
      useRef<HTMLButtonElement>(null), 
      useRef<HTMLButtonElement>(null), 
      useRef<HTMLButtonElement>(null), 
      useRef<HTMLButtonElement>(null)];

  const buttonClickNotifier = () => {
    // If buttonIndex has been changed,
    // modify the class names of the buttons,
    // and notify the change of the buttonIndex 
    // to the parent component.
    if (buttonIndexMem !== buttonIndex) {
      buttonIndexMem = buttonIndex;
      buttonRefs.forEach((value, index) => {
        value.current?.classList.remove('is-dark')
        if (index === buttonIndex)
          value.current?.classList.add('is-dark')
      })
      handleButtonClick(buttonValues[buttonIndex]);
    }
  }

  useEffect(() => {
    buttonClickNotifier();
  }, [buttonIndex])

  return (
    <div className='container'>
      <div className="buttons are-small has-addons is-pulled-right mb-0">
        {buttonValues.map((value, index) => {
          const isSeleted = index === buttonIndex;
          const is_dark = isSeleted? 'is-dark' : '';
          return (
            <button 
              key={index}
              className={`button ${is_dark}`} 
              ref={buttonRefs[index]}
              onClick={()=>setButtonIndex(index)}
            >
              {value}
            </button>
          )
        })}
      </div>
      <Line 
        data={decorateData(data)}
        options={{
          interaction: {
            intersect: false,
            mode: 'index',
          },
          plugins: {
            /* Tooltip Design Properties */
            tooltip: {
              callbacks: {
                // Label value is the amount of money
                label: function(tooltipItem) {
                  if (tooltipItem.dataset.label === "Money Flow")
                    return '$ ' + tooltipItem.formattedValue;
                  else 
                    return '';
                },
                footer: function(tooltipItems) {
                  const lastTooltipItem = tooltipItems[tooltipItems.length-1];
                  if (lastTooltipItem.dataset.label === "Net Income History") {
                    const value:number = parseFloat(lastTooltipItem.formattedValue.replace(',', ''));
                    const sign = value < 0 ? '-' : '+';
                    return `${sign} ${Math.abs(value)} USD`;
                  } else {
                    return '';
                  }
                }
              },
              // Tooltip Structure
              backgroundColor: accent,
              padding: {
                top: 8,
                bottom: 6,
                left: 10,
                right: 10,
              },
              // Title Properties
              titleMarginBottom: 6,
              titleColor: secondaryFontColor,
              titleFont: {
                weight: 'normal',
                size: 14,
              },
              // Body Properties
              bodyColor: fontColor,
              bodyFont: {
                weight: 'bold',
                size: 16,
              },
              // Footer Properties
              footerColor: accentFontColor,
              footerFont: {
                weight: 'normal',
                size: 12,
              },
              // Border Properties
              borderColor: accent,
              borderWidth: 2,
              // Don't show the wierd square next to the body
              displayColors: false
            },
            title: {
              display: false
            },
            legend: {
              display: false
            },
          },
          scales: {
            y: {
              ticks: {
                display: false,
              },
              grid: {
                display: false,
              },
              border: {
                display: false,
              }
            },
            x: {
              ticks: {
                callback: function(value, index, ticks) {
                  if (buttonValues[buttonIndex] == '3y') {
                    const slices = this.getLabelForValue(index).split(',');
                    const season:string = slices[0];
                    const year:string = slices[1]?.slice(3, 5);
                    if (0 <= +season && +season < seasons.length) 
                      return `${seasons[+season]}.${year}`;
                  }
                  if (buttonValues[buttonIndex] == '1y') {
                    const slices = this.getLabelForValue(index).split(',');
                    const month:string = slices[0];
                    const year:string = slices[1]?.slice(3, 5);
                    if (0 <= +month-1 && +month-1 < months.length) 
                      return `${months[+month-1].slice(0, 3)}.${year}`;
                  }
                  if (buttonValues[buttonIndex] == '6m') {
                    const label:string = this.getLabelForValue(index).split(',')[0];
                    if (0 <= +label-1 && +label-1 < months.length) 
                      return months[+label-1].slice(0, 3);
                  }
                  if (buttonValues[buttonIndex] == '3m') {
                    const slices = this.getLabelForValue(index).split(',');
                    return `${slices[0]}.${slices[1]}`;
                  }
                  if (buttonValues[buttonIndex] == '1m') {
                    const label:string = this.getLabelForValue(index).split(',')[0];
                    if ((+label)%5 === 0 || (+label) === 1)
                      return label;
                  }
                  return null;
                }
              },
              grid: {
                color: 'rgba(100, 100, 100, 0.1)',
                lineWidth: 1,
              },
              border: {
                display: false,
              }
            },
          },
        }}
      />
    </div>)
}

export default LineChart;