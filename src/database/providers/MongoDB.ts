import { ColumnType, DisclosureError, ExtractColumnType, FunctionProvider, StoreProvider, validate } from '../../';
import { Document } from 'mongoose';

interface ModelDefinition<T extends ColumnType> extends Document {
    key: string;
    value: ExtractColumnType<T>;
}

export function MongoDB(uri: string): FunctionProvider {
    try {

        const mongoose = require('mongoose') as typeof import('mongoose');

        const connection = mongoose.createConnection(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: true,
        });

        const provider: FunctionProvider = <T extends ColumnType>(s: string, t: T) => {

            const type =
                t === 'boolean' ? Boolean :
                    t === 'number' ? Number :
                        t === 'string' ? String : undefined;

            const model = connection.model<ModelDefinition<T>>(s, new mongoose.Schema({
                key: String,
                value: type,
            }));

            return new class extends StoreProvider {

                async get(k: string): Promise<ExtractColumnType<T>> {
                    const inst = await model.findOne({ key: k });
                    if (inst) return inst.value;
                    return undefined;
                }

                async set(k: string, v: ExtractColumnType<T>) {
                    validate(v, t);
                    const inst = await model.findOne({ key: k });
                    if (inst) {
                        inst.value = v;
                        await inst.save();
                    } else {
                        await model.create({ key: k, value: v });
                    }
                }

                async del(k: string) {
                    return !!(await model.deleteOne({ key: k })).deletedCount;
                }

                async clr() {
                    await model.deleteMany();
                }

                async all() {
                    const entries = await model.find({});
                    const mapped = entries.map((entry) => [entry.key, entry.value]);
                    return mapped as [string, ExtractColumnType<T>][];
                }

            };
        };

        return provider;

    } catch (_err) {
        throw new DisclosureError(`Please install \'mongoose\' manually.`);
    }
}