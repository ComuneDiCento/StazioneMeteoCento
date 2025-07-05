import { FC } from "react";
import { Headers } from "design-react-kit";
import { SlimHeader } from "./SlimHeader";
import { CenterHeader } from "./CenterHeader";

export const CompleteHeader: FC = () => {
	return (
		<Headers sticky={true}>
			<SlimHeader />
			<div className="it-nav-wrapper">
				<CenterHeader />
			</div>
		</Headers>
	);
};
