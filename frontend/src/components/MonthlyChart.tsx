import { useState } from "react";
import { DateField } from "../services/models";
import { Map } from "../util/utils";
// Fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
// Chart.js
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";


// Chart.js - dataset example
ChartJS.register(ArcElement, Tooltip, Legend);

export const data = {
  
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 0,
    },
  ],
};


export const months = Array.from({length: 12}, (e, i) => {
  return new Date(1990, i, 1).toLocaleDateString("en", {month: "long"});
})

type MonthlyChartProps = {
  dataset: Map | undefined,
  year:number, 
  month:number, 
  onLeftClick:Function, 
  onRightClick:Function
};

function MonthlyChart({dataset, year, month, onLeftClick, onRightClick}: MonthlyChartProps):JSX.Element {

  const [curYear, setCurYear] = useState<number>((new DateField()).year);
  const [curMonth, setCurMonth] = useState<number>((new DateField()).month);

  const keysArray: string[] = dataset ? Array.from(dataset.keys()) : [];

  console.log(dataset);
  return (
    <>
      <section className="hero is-small has-background-black-ter p-2">
        <article className="media media-li">
            <div className="media-content">
              <div className="is-pulled-left" style={{cursor: 'pointer'}} onClick={()=>onLeftClick()}>
                <FontAwesomeIcon className="media-left mon-hero-icon" size="lg" icon={faChevronLeft} style={{color: "#ffffff",}} />
              </div>
              <p className="has-text-centered mon-hero-title has-text-white-ter">{months[month-1]} {year}</p>
            </div>
            {(() => { 
              if (curYear === year && curMonth === month){
                return (
                  <p className="mr-4"></p>
                )
              }
              return (
                <div className="is-pulled-right" style={{cursor: 'pointer'}} onClick={()=>onRightClick()}>
                  <FontAwesomeIcon className="media-right mon-hero-icon" size="lg" icon={faChevronRight} style={{color: "#ffffff",}} />
                </div>
              );
            })()}
        </article>
      </section>
      <br></br>
      <Doughnut data={data} />
    </>
  )
}

export default MonthlyChart;
