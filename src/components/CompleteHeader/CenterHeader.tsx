import { FC } from "react";
import { Header, HeaderContent, HeaderRightZone, HeaderSocialsZone, Icon, HeaderBrand } from "design-react-kit";

type Props = any;

export const CenterHeader: FC<Props> = ({ props }) => {
	return (
		<Header type="center" theme={props?.theme}>
			<HeaderContent>
				<HeaderBrand iconName="src/assets/stemma.png" iconAlt={"Stemma del Comune di Cento"}>
					<h2>Comune di Cento</h2>
				</HeaderBrand>
				<HeaderRightZone>
					<HeaderSocialsZone label="Seguici su">
						<ul>
							<li>
								<a href="https://www.facebook.com/ComuneCento/" aria-label="Facebook" target="_blank">
									<Icon icon="it-facebook" />
								</a>
							</li>
							<li>
								<a href="https://www.instagram.com/comunedicento/" aria-label="Instagram" target="_blank">
									<Icon icon="it-instagram" />
								</a>
							</li>
							<li>
								<a href="https://www.youtube.com/user/comunedicento" aria-label="YouTube" target="_blank">
									<Icon icon="it-youtube" />
								</a>
							</li>	
						</ul>
					</HeaderSocialsZone>
				</HeaderRightZone>
			</HeaderContent>
		</Header>
	);
};
