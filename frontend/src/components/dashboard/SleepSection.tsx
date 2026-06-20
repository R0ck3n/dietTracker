import { useEffect, useState } from 'react';
import { journalApi, sleepApi } from '../../api';
import type { JournalDay } from '../../api/types';
import { combineBedWake, parseIsoTime } from '../../utils/dates';
import { MoonIcon } from '../icons/Icons';
import { Card, CardBody, CardHeader, type CardLayout } from '../ui/Card';
import { TimeStepper } from '../ui/NumberStepper';
import { SaveButton } from '../ui/SaveButton';
import styles from './Sections.module.css';

type SectionProps = {
  date: string;
  day: JournalDay;
  onUpdate: (day: JournalDay) => void;
  layout?: CardLayout;
};

export function SleepSection({ date, day, onUpdate, layout }: SectionProps) {
  const sleep = day.sleep;
  const bed = sleep ? parseIsoTime(sleep.bedTime) : { hours: 22, minutes: 30 };
  const wake = sleep ? parseIsoTime(sleep.wakeTime) : { hours: 7, minutes: 0 };

  const [bedHours, setBedHours] = useState(bed.hours);
  const [bedMinutes, setBedMinutes] = useState(bed.minutes);
  const [wakeHours, setWakeHours] = useState(wake.hours);
  const [wakeMinutes, setWakeMinutes] = useState(wake.minutes);
  const [savingWake, setSavingWake] = useState(false);
  const [savingBed, setSavingBed] = useState(false);

  useEffect(() => {
    if (!day.sleep) return;

    const nextBed = parseIsoTime(day.sleep.bedTime);
    const nextWake = parseIsoTime(day.sleep.wakeTime);
    setBedHours(nextBed.hours);
    setBedMinutes(nextBed.minutes);
    setWakeHours(nextWake.hours);
    setWakeMinutes(nextWake.minutes);
  }, [day.sleep?.id, day.sleep?.bedTime, day.sleep?.wakeTime]);

  async function saveSleep(bedH: number, bedM: number, wakeH: number, wakeM: number) {
    const { bedTime, wakeTime } = combineBedWake(date, bedH, bedM, wakeH, wakeM);
    const input = {
      bedTime,
      wakeTime,
      comment: day.sleep?.comment ?? null,
      interruptions: day.sleep?.interruptions.map(({ startTime, endTime, comment }) => ({
        startTime,
        endTime,
        comment,
      })) ?? [],
    };

    if (day.sleep) {
      await sleepApi.update(day.sleep.id, input);
    } else {
      await sleepApi.upsert(date, input);
    }

    const updated = await journalApi.getDay(date);
    onUpdate(updated);
  }

  return (
    <Card variant="sleep" className={styles.section} layout={layout}>
      <CardHeader icon={<MoonIcon />} title="Sommeil" accent="sleep" />
      <CardBody>
        <div className={styles.sleepRow}>
          <span className={styles.sleepLabel}>
            Coucher
            <span className={styles.sleepHint}> (de la veille)</span>
          </span>
          <TimeStepper hours={bedHours} minutes={bedMinutes} onHoursChange={setBedHours} onMinutesChange={setBedMinutes} />
          <SaveButton
            disabled={savingBed}
            onClick={() => {
              setSavingBed(true);
              void saveSleep(bedHours, bedMinutes, wakeHours, wakeMinutes).finally(() => setSavingBed(false));
            }}
          />
        </div>
        <div className={styles.sleepRow}>
          <span className={styles.sleepLabel}>Réveil</span>
          <TimeStepper hours={wakeHours} minutes={wakeMinutes} onHoursChange={setWakeHours} onMinutesChange={setWakeMinutes} />
          <SaveButton
            disabled={savingWake}
            onClick={() => {
              setSavingWake(true);
              void saveSleep(bedHours, bedMinutes, wakeHours, wakeMinutes).finally(() => setSavingWake(false));
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
}
