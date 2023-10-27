import { JSONObject, JSONArray } from '../util/json';
import { DateField, Model, IncomeModel, ExpenseModel, DateDelta } from './models';

interface ModelDeserializer<T extends Model> {
  json: JSONObject;
  model: T;
  data() : T;
}

export class IncomeDeserializer implements ModelDeserializer<IncomeModel> {
  json: JSONObject;
  model: IncomeModel;
  constructor(json: JSONObject) {
    this.json = json;
    this.model = this.deserialize(json);
  }

  private deserialize(json: JSONObject): IncomeModel {
    const intervalParts = (json.interval as string).split("-");
    const interval = new DateDelta(+intervalParts[0], +intervalParts[1], +intervalParts[2]);
    const dateParts = (json.date as string).split("-");
    const date = new DateField(+dateParts[0], +dateParts[1], +dateParts[2]);
    return new IncomeModel(
      json.id as number,
      json.user as number,
      parseFloat(json.amount as string),
      json.source as string,
      json.description as string,
      json.type as boolean,
      interval,
      date,
    );
  }

  public data(): IncomeModel {
    return this.model;
  }
}

export class ExpenseDeserializer implements ModelDeserializer<ExpenseModel> {
  json: JSONObject;
  model: ExpenseModel;
  constructor(json: JSONObject) {
    this.json = json;
    this.model = this.deserialize(json);
  }

  private deserialize(json: JSONObject): ExpenseModel {
    const intervalParts = (json.interval as string).split("-");
    const interval = new DateDelta(+intervalParts[0], +intervalParts[1], +intervalParts[2]);
    const dateParts = (json.date as string).split("-");
    const date = new DateField(+dateParts[0], +dateParts[1], +dateParts[2]);
    return new ExpenseModel(
      json.id as number,
      json.user as number,
      parseFloat(json.amount as string),
      json.category as string,
      json.description as string,
      json.type as boolean,
      interval,
      date,
    );
  }

  public data(): ExpenseModel {
    return this.model;
  }
}

class ModelListDeserializer<T extends Model> {
  constructor(
    private jsonArray: JSONArray,
    private deserializer: new (json: JSONObject) => ModelDeserializer<T>,
  ) {}

  public data(): Array<T> {
    return this.jsonArray.map((obj) => new this.deserializer(obj as JSONObject).data());
  }
}

export class IncomeListDeserializer extends ModelListDeserializer<IncomeModel> {
  constructor(jsonArray: JSONArray) {
    super(jsonArray, IncomeDeserializer);
  }

  public override data(): Array<IncomeModel>  {
    return super.data();
  }
}

export class ExpenseListDeserializer extends ModelListDeserializer<ExpenseModel> {
  constructor(jsonArray: JSONArray) {
    super(jsonArray, ExpenseDeserializer);
  }

  public override data(): Array<ExpenseModel>  {
    return super.data();
  }
}