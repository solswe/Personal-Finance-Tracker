export interface Model {}

export class DateDelta {
  y_delta:number;
  m_delta:number;
  d_delta:number;
  constructor(
    y_delta: number = 0,
    m_delta: number = 0,
    d_delta: number = 0
  ) {
    this.y_delta = y_delta;
    this.m_delta = m_delta;
    this.d_delta = d_delta;
  }

  toString() : string {
    return `${this.y_delta}-` 
      + `${this.m_delta.toString()}-` 
      + `${this.d_delta.toString()}`;
  }
}

export class DateField {
  year: number;
  month: number;
  day: number;

  constructor(
    year: number  = (new Date()).getFullYear(), 
    month: number = (new Date()).getMonth()+1, 
    day: number   = (new Date()).getDate()
  ) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  getBrief() {
    return this.month + "." + this.day;
  }

  toString() : string {
    return `${this.year}-` 
      + `${this.month.toString().padStart(2, '0')}-` 
      + `${this.day.toString().padStart(2, '0')}`;
  }
}

export function convertDateToField(date:string): DateField {
  const dateParts = date.split("-");
  return new DateField(+dateParts[0], +dateParts[1], +dateParts[2]);
}

//date:string, description:string, tag:string, amount:number,
export class ItemModel implements Model {
  id: number|null;
  userId: number;
  description: string;
  tag: string;
  amount: number;
  interval: DateDelta;
  date: DateField;

  constructor(
    id:number|null        = null, 
    userId:number         = 0, 
    description:string    = '',
    tag:string            = 'none',
    amount:number         = 0, 
    interval:DateDelta    = new DateDelta(),
    date:DateField        = new DateField()
  ) {
    this.id = id;
    this.userId = userId;
    this.description = description;
    this.tag = tag;
    this.amount = amount;
    this.interval = interval;
    this.date = date;
  }
}

// FIXIT: Income Model needs Description!!!
export class IncomeModel extends ItemModel {
  fixed: boolean;

  constructor(
    id:number|null        = null,
    userId:number         = 0,
    amount:number         = 0,
    source:string         = 'none',
    description:string    = '',
    type:boolean          = false,
    interval:DateDelta    = new DateDelta(),
    date:DateField        = new DateField()
  ) {
    super(id, userId, description, source, amount, interval, date);
    this.fixed = type;
  }
}

export class ExpenseModel extends ItemModel {
  recurring: boolean;

  constructor(
    id:number|null        = null,
    userId:number         = 0,
    amount:number         = 0,
    category:string       = 'none',
    description:string    = '',
    type:boolean          = false,
    interval:DateDelta    = new DateDelta(),
    date:DateField        = new DateField()
  ) {
    super(id, userId, description, category, amount, interval, date);
    this.recurring = type;
  }
}
