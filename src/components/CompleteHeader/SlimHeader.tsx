import { FC, useState } from "react";
import {
	Header,
	HeaderContent,
	HeaderRightZone,
	HeaderToggler,
	HeaderLinkZone,
	Icon,
	HeaderBrand
} from "design-react-kit";

type Props = any;

export const SlimHeader: FC<Props> = ({ props }) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggle = () => {
		setIsOpen(isOpen => !isOpen);
	};

	return (
		<Header type="slim" theme={props?.theme}>
			<HeaderContent>
				<HeaderBrand>Regione Emilia-Romagna</HeaderBrand>
				<HeaderLinkZone>
					<HeaderToggler onClick={toggle}>
						<span>Regione Emilia-Romagna</span>
						<Icon icon="it-expand" />
					</HeaderToggler>

				</HeaderLinkZone>
				<HeaderRightZone>
					
				</HeaderRightZone>
			</HeaderContent>
		</Header>
	);
};
