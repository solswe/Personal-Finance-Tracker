import { JSONObject } from '../util/json';
import { Model, IncomeModel, ExpenseModel } from './models';

interface ModelSerializer<T extends Model> {
  model: T;
  json: JSONObject;
  data() : JSONObject;
}

export class IncomeSerializer implements ModelSerializer<IncomeModel> {
  model: IncomeModel;
  json: JSONObject;
  constructor(model: IncomeModel) {
    this.model = model;
    this.json = this.serialize();

    this.serialize = this.serialize.bind(this);
  }

  // TODO: Implement Serializer
  private serialize(): JSONObject {
    return {
      user: this.model.userId,
      amount: this.model.amount,
      source: this.model.tag,
      description: this.model.description,
      type: this.model.fixed,
      interval: this.model.interval.toString(),
      date: this.model.date.toString()
    }
  }

  data(): JSONObject {
    return this.json;
  }
}

export class ExpenseSerializer implements ModelSerializer<ExpenseModel> {
  model: ExpenseModel;
  json: JSONObject;
  constructor(model: ExpenseModel) {
    this.model = model;
    this.json = this.serialize();
  }

  // TODO: Implement Serializer
  private serialize(): JSONObject {
    return {
      user: this.model.userId,
      amount: this.model.amount,
      category: this.model.tag,
      description: this.model.description,
      type: this.model.recurring,
      interval: this.model.interval.toString(),
      date: this.model.date.toString()
    }
  }

  data(): JSONObject {
    return this.json;
  }
}