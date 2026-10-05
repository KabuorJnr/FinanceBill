import { useState, type ReactElement } from 'react';
import { Tray } from 'morphlet';

import {
  AllHotelsView,
  HotelView,
  NEW_STAY,
  StayView,
  type IStay,
} from './hotel-views';
import type { IHotel } from './hotels.data';
import { TikitiHeader } from './tikiti-parts';
import { TIKITI_TRAY_CONTENT } from './tikiti.theme';

export function HotelsTray({ children }: { children: ReactElement }) {
  const [hotel, setHotel] = useState<IHotel | null>(null);
  const [stay, setStay] = useState<IStay>(NEW_STAY);

  return (
    <Tray.Root defaultView="all">
      <Tray.Trigger asChild morph>
        {children}
      </Tray.Trigger>

      <Tray.Content {...TIKITI_TRAY_CONTENT}>
        <TikitiHeader
          views={{
            all: { title: 'Where to Stay in Kenya' },
            hotel: { title: hotel?.name ?? 'Hotel' },
            stay: { title: '', back: false },
          }}
        />
        <Tray.Body>
          <Tray.View name="all">
            <AllHotelsView
              onSelect={(next) => {
                setHotel(next);
                setStay(NEW_STAY);
              }}
            />
          </Tray.View>
          <Tray.View name="hotel">
            {hotel && (
              <HotelView hotel={hotel} stay={stay} onStayChange={setStay} />
            )}
          </Tray.View>
          <Tray.View name="stay">
            {hotel && <StayView hotel={hotel} stay={stay} />}
          </Tray.View>
        </Tray.Body>
      </Tray.Content>
    </Tray.Root>
  );
}
