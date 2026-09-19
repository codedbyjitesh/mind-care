import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Helpline {
  name: string;
  phone: string;
  availability: string;
  description: string;
  badge: string;
  website?: string;
}

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help.component.html',
  styleUrl: './help.component.css'
})
export class HelpComponent {
  helplines: Helpline[] = [
    {
      name: 'Tele-MANAS (Govt of India)',
      phone: '14416 / 1800-891-4416',
      availability: '24 Hours / 7 Days (Toll-Free)',
      description: 'National Tele-Mental Health Programme offering free, confidential psychological counseling in multiple regional languages.',
      badge: 'National Helpline',
      website: 'https://telemanas.mohfw.gov.in/'
    },
    {
      name: 'KIRAN Mental Health Helpline',
      phone: '1800-599-0019',
      availability: '24/7 Toll-Free Support',
      description: 'Operated by the Ministry of Social Justice & Empowerment for early screening, psychological first aid, panic management, and distress alleviation.',
      badge: 'Government Certified',
      website: 'https://disabilityaffairs.gov.in/content/page/kiran.php'
    },
    {
      name: 'Vandrevala Foundation Helpline',
      phone: '+91 9999 666 555',
      availability: '24x7 Multi-lingual Care',
      description: 'Free mental health support provided by experienced clinical psychologists and counselors for students in emotional distress.',
      badge: 'NGO & Crisis Care',
      website: 'https://www.vandrevalafoundation.com/'
    },
    {
      name: 'iCall Psychosocial Helpline (TISS)',
      phone: '+91 9152 987 821',
      availability: 'Mon - Sat: 10:00 AM - 8:00 PM',
      description: 'Run by Tata Institute of Social Sciences, offering youth and student-centric mental health guidance and counseling.',
      badge: 'Academic Support',
      website: 'https://icallhelpline.org/'
    },
    {
      name: 'National Emergency Service (India)',
      phone: '112',
      availability: '24/7 Immediate Dispatch',
      description: 'All-in-one emergency service for immediate life safety, ambulance, police, or medical emergency intervention.',
      badge: 'Immediate Danger'
    }
  ];

  warningSigns = [
    'Persistent feelings of hopelessness, severe panic, or uncontrollable dread lasting several consecutive days.',
    'Significant changes in sleep patterns (sleeping less than 3 hours or unable to leave bed for days).',
    'Total withdrawal from friends, family, and lectures with overwhelming feelings of isolation.',
    'Recurring inability to function, concentrate on exams, or manage basic personal care.',
    'Thoughts of self-harm or feelings that others would be better off without you.'
  ];
}
