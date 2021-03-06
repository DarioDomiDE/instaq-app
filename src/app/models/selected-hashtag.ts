import { Hashtag } from './hashtag';

export class SelectedHashtag extends Hashtag {
    public categoryId: number;

    public constructor(init?: Partial<SelectedHashtag>) {
        super(init.title);
        Object.assign(this, init);
    }

}