import { FC } from "react";
import { Headers } from "design-react-kit";
import { SlimHeader } from "./SlimHeader";
import { CenterHeader } from "./CenterHeader";

interface CompleteHeaderProps {
  historyHours: number;
}

export const CompleteHeader: FC<CompleteHeaderProps> = ({ historyHours }) => {
return (
		<Headers sticky>
			<SlimHeader />
			<div className="it-nav-wrapper">
				<CenterHeader
					historyHours={historyHours}
				/>
			</div>
		</Headers>
	);
};
