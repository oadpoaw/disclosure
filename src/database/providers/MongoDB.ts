import { ColumnType, ExtractColumnType, FunctionProvider, StoreProvider } from '../StoreProvider';
import { DisclosureError } from '../../DisclosureError';
import { validate } from '../util/validate';

export async function MongoDB(uri: string): Promise<FunctionProvider> {
    return new Promise((resolve, reject) => {
        import('mongoose').then(async (mongoose) => {
            try {
                const connection = await mongoose.createConnection(uri, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useFindAndModify: true,
                });
                const provider: FunctionProvider = <T extends ColumnType>(s: string, t: T) => {
                    const type =
                        t === 'boolean' ? Boolean :
                            t === 'number' ? Number :
                                t === 'string' ? String : undefined;
                    const model = connection.model(s, new mongoose.Schema({
                        key: String,
                        value: type,
                    }));
                    return new class extends StoreProvider {
                        async get(k: string): Promise<ExtractColumnType<T>> {
                            const inst = await model.findOne({ key: k });
                            if (inst) return inst.get('value');
                            return undefined;
                        }
                        async set(k: string, v: ExtractColumnType<T>) {
                            validate(v, t);
                            const inst = await model.findOneAndUpdate({ key: k }, { value: v });
                            if (!inst) await model.create({ key: k, value: v });
                        }
                        async del(k: string) {
                            return !!(await model.deleteOne({ key: k })).deletedCount;
                        }
                    };
                };
                return resolve(provider);
            } catch (err) {
                reject(err);
            }
        }).catch(() => {
            reject(new DisclosureError(`Please install \'mongoose\' manually.`));
        });
    });
}